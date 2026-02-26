#!/usr/bin/env python3
"""
Sing-Box Manager Backend - FastAPI Service
Provides HTTP API for controlling sing-box service on Steam Deck
"""

import os
import json
import subprocess
import shutil
from typing import Optional, List, Dict, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Sing-Box Manager API")

# Enable CORS for plugin communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
CONFIG_DIR = Path("/home/deck/.config/sing-box")
CONFIG_FILE = CONFIG_DIR / "config.json"
SING_BOX_SERVICE = "sing-box"

# Ensure config directory exists
CONFIG_DIR.mkdir(parents=True, exist_ok=True)


class URLRequest(BaseModel):
    url: str


class NodeSelectRequest(BaseModel):
    node_name: str


class ServiceStatus(BaseModel):
    active: bool
    running: bool
    status: str


def run_command(cmd: List[str], use_sudo: bool = True) -> subprocess.CompletedProcess:
    """Run shell command with optional sudo"""
    if use_sudo:
        cmd = ["sudo"] + cmd
    return subprocess.run(cmd, capture_output=True, text=True)


def check_singbox_installed() -> bool:
    """Check if sing-box is installed"""
    result = subprocess.run(["which", "sing-box"], capture_output=True, text=True)
    return result.returncode == 0


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


@app.get("/status", response_model=ServiceStatus)
async def get_status():
    """Get sing-box service status"""
    try:
        # Check systemd service status
        result = run_command(["systemctl", "is-active", SING_BOX_SERVICE], use_sudo=True)
        is_active = result.stdout.strip() == "active"

        # Also check if process is running
        ps_result = run_command(["pgrep", "-x", "sing-box"], use_sudo=False)
        is_running = ps_result.returncode == 0

        return ServiceStatus(
            active=is_active,
            running=is_running,
            status=result.stdout.strip() or "inactive"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/start")
async def start_service():
    """Start sing-box service"""
    try:
        if not CONFIG_FILE.exists():
            raise HTTPException(status_code=400, detail="Configuration file not found")

        result = run_command(["systemctl", "start", SING_BOX_SERVICE], use_sudo=True)
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=result.stderr)

        return {"success": True, "message": "Service started"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/stop")
async def stop_service():
    """Stop sing-box service"""
    try:
        result = run_command(["systemctl", "stop", SING_BOX_SERVICE], use_sudo=True)
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=result.stderr)

        return {"success": True, "message": "Service stopped"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/restart")
async def restart_service():
    """Restart sing-box service"""
    try:
        result = run_command(["systemctl", "restart", SING_BOX_SERVICE], use_sudo=True)
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=result.stderr)

        return {"success": True, "message": "Service restarted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/config/fetch")
async def fetch_config(request: URLRequest):
    """Download configuration from URL"""
    try:
        # Download config using curl
        temp_file = CONFIG_DIR / "config.tmp"
        result = run_command(
            ["curl", "-L", "-o", str(temp_file), request.url],
            use_sudo=False
        )

        if result.returncode != 0:
            raise HTTPException(status_code=400, detail=f"Failed to download: {result.stderr}")

        # Validate JSON
        try:
            with open(temp_file, 'r') as f:
                config = json.load(f)
        except json.JSONDecodeError as e:
            temp_file.unlink(missing_ok=True)
            raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")

        # Move to config file
        shutil.move(str(temp_file), str(CONFIG_FILE))

        return {
            "success": True,
            "message": "Configuration downloaded",
            "outbounds_count": len(config.get("outbounds", []))
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/config/nodes")
async def get_nodes():
    """Get list of available proxy nodes from configuration"""
    try:
        if not CONFIG_FILE.exists():
            raise HTTPException(status_code=404, detail="Configuration file not found")

        with open(CONFIG_FILE, 'r') as f:
            config = json.load(f)

        outbounds = config.get("outbounds", [])
        nodes = []

        for i, outbound in enumerate(outbounds):
            # Skip selector and urltest type outbounds
            if outbound.get("type") in ["selector", "urltest"]:
                continue

            node_info = {
                "index": i,
                "name": outbound.get("tag", f"Node {i}"),
                "type": outbound.get("type", "unknown"),
            }
            nodes.append(node_info)

        return {"nodes": nodes, "total": len(nodes)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/config/select")
async def select_node(request: NodeSelectRequest):
    """Select a proxy node by modifying the configuration"""
    try:
        if not CONFIG_FILE.exists():
            raise HTTPException(status_code=404, detail="Configuration file not found")

        with open(CONFIG_FILE, 'r') as f:
            config = json.load(f)

        # Find or create selector outbound
        selector = None
        selector_index = -1

        for i, outbound in enumerate(config.get("outbounds", [])):
            if outbound.get("type") == "selector":
                selector = outbound
                selector_index = i
                break

        if selector is None:
            # Create a new selector as the first outbound
            selector = {
                "type": "selector",
                "tag": "proxy",
                "outbounds": []
            }
            if "outbounds" not in config:
                config["outbounds"] = []
            config["outbounds"].insert(0, selector)
            selector_index = 0

        # Set the selected node
        selector["outbounds"] = [request.node_name]

        # Update route to use selector as default
        if "route" not in config:
            config["route"] = {}
        config["route"]["auto_detect_interface"] = True

        # Save configuration
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)

        return {
            "success": True,
            "message": f"Selected node: {request.node_name}",
            "node_name": request.node_name
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/config/logs")
async def get_logs(lines: int = 50):
    """Get recent sing-box logs"""
    try:
        result = run_command(
            ["journalctl", "-u", SING_BOX_SERVICE, "-n", str(lines), "--no-pager"],
            use_sudo=True
        )
        return {"logs": result.stdout}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/singbox/version")
async def get_singbox_version():
    """Get sing-box version"""
    try:
        result = subprocess.run(
            ["sing-box", "version"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            return {"version": result.stdout.strip()}
        return {"version": "Not installed"}
    except Exception:
        return {"version": "Not installed"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5555)
