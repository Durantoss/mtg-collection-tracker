#!/usr/bin/env python3
"""
Simple HTTPS server for testing PWA functionality locally.
Run this script to serve your MTG Collection Tracker with HTTPS support.

Usage: python serve.py [port]
Default port: 8443
"""

import http.server
import ssl
import socketserver
import sys
import os
from pathlib import Path

def create_self_signed_cert():
    """Create a self-signed certificate for local testing."""
    try:
        import subprocess
        
        # Check if certificate already exists
        if os.path.exists('server.crt') and os.path.exists('server.key'):
            print("✅ Using existing SSL certificate")
            return True
            
        print("🔐 Creating self-signed SSL certificate...")
        
        # Create self-signed certificate using openssl
        cmd = [
            'openssl', 'req', '-x509', '-newkey', 'rsa:4096', '-keyout', 'server.key',
            '-out', 'server.crt', '-days', '365', '-nodes', '-subj',
            '/C=US/ST=Local/L=Local/O=MTG Tracker/CN=localhost'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ SSL certificate created successfully")
            return True
        else:
            print("❌ Failed to create SSL certificate")
            print("Please install OpenSSL or create certificates manually")
            return False
            
    except FileNotFoundError:
        print("❌ OpenSSL not found. Please install OpenSSL to create SSL certificates.")
        print("Alternative: Use 'python -m http.server' for HTTP (limited PWA functionality)")
        return False

def main():
    # Get port from command line argument or use default
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8443
    
    # Change to the directory containing this script
    os.chdir(Path(__file__).parent)
    
    print(f"🃏 MTG Collection Tracker - Local HTTPS Server")
    print(f"📁 Serving from: {os.getcwd()}")
    print(f"🌐 Port: {port}")
    print("-" * 50)
    
    # Try to create SSL certificate
    if not create_self_signed_cert():
        print("\n⚠️  Falling back to HTTP server (limited PWA functionality)")
        print(f"🌐 Starting HTTP server on http://localhost:{port}")
        
        with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as httpd:
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n👋 Server stopped")
        return
    
    # Create HTTPS server
    print(f"🚀 Starting HTTPS server on https://localhost:{port}")
    print(f"📱 Open this URL in your browser to test PWA functionality")
    print(f"⚠️  You may need to accept the self-signed certificate warning")
    print("\n🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as httpd:
            # Create SSL context
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.load_cert_chain('server.crt', 'server.key')
            
            # Wrap the socket with SSL
            httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
            
            print(f"✅ HTTPS server running at https://localhost:{port}")
            print(f"📋 Test your PWA features:")
            print(f"   • Service Worker registration")
            print(f"   • Offline functionality")
            print(f"   • Install prompt")
            print(f"   • Manifest validation")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        print("💡 Try running with a different port: python serve.py 8080")

if __name__ == "__main__":
    main()
