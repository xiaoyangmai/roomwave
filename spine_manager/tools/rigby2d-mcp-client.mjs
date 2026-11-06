import { spawn } from 'node:child_process';

export class Rigby2DMcpClient {
  constructor({ repoRoot, serverPath = null } = {}) {
    this.repoRoot = repoRoot;
    this.serverPath = serverPath || repoRoot + '/rigby2d/src/mcp/server.js';
    this.child = null;
    this.nextId = 1;
    this.pending = new Map();
    this.stdoutBuffer = '';
    this.stderr = [];
    this.serverInfo = null;
    this.availableTools = new Set();
  }

  async start() {
    if (this.child) return this;
    this.child = spawn(process.execPath, [this.serverPath, '--root', this.repoRoot], {
      cwd: this.repoRoot + '/rigby2d',
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    this.child.stdout.setEncoding('utf8');
    this.child.stderr.setEncoding('utf8');
    this.child.stdout.on('data', (chunk) => this.#onStdout(chunk));
    this.child.stderr.on('data', (chunk) => this.stderr.push(String(chunk)));
    this.child.on('exit', (code, signal) => {
      const error = new Error('Rigby2D MCP exited before the request completed: code=' + code + ', signal=' + signal);
      for (const pending of this.pending.values()) pending.reject(error);
      this.pending.clear();
    });
    const initialized = await this.request('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'roomwave-loop-only', version: '1.0.0' },
    });
    this.serverInfo = initialized.result?.serverInfo || initialized.serverInfo || null;
    this.notify('notifications/initialized', {});
    const tools = await this.request('tools/list', {});
    this.availableTools = new Set((tools.result?.tools || tools.tools || []).map((tool) => tool.name));
    return this;
  }

  notify(method, params) {
    if (!this.child || !this.child.stdin.writable) return;
    this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
  }

  request(method, params) {
    if (!this.child || !this.child.stdin.writable) return Promise.reject(new Error('Rigby2D MCP is not running.'));
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  }

  async callTool(name, args) {
    if (this.availableTools.size && !this.availableTools.has(name)) throw new Error('Rigby2D MCP tool is unavailable: ' + name);
    const response = await this.request('tools/call', { name, arguments: args });
    const result = response.result;
    if (!result) throw new Error('Rigby2D MCP returned no result for ' + name);
    if (result.isError) {
      const message = result.content && result.content[0] && result.content[0].text;
      throw new Error('Rigby2D MCP tool failed: ' + name + ': ' + (message || 'unknown error'));
    }
    if (result.structuredContent !== undefined) return result.structuredContent;
    const text = result.content && result.content[0] && result.content[0].text;
    return text ? JSON.parse(text) : null;
  }

  async close() {
    if (!this.child) return;
    const child = this.child;
    this.child = null;
    if (child.stdin.writable) child.stdin.end();
    await new Promise((resolve) => {
      const timer = setTimeout(() => {
        if (child.exitCode === null) child.kill();
        resolve();
      }, 1500);
      child.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  #onStdout(chunk) {
    this.stdoutBuffer += chunk;
    let newline;
    while ((newline = this.stdoutBuffer.indexOf('\n')) >= 0) {
      const line = this.stdoutBuffer.slice(0, newline).trim();
      this.stdoutBuffer = this.stdoutBuffer.slice(newline + 1);
      if (!line) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch (error) {
        this.stderr.push('Invalid MCP stdout line: ' + line);
        continue;
      }
      if (message.id === undefined) continue;
      const pending = this.pending.get(message.id);
      if (!pending) continue;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message || 'Rigby2D MCP request failed'));
      else pending.resolve(message);
    }
  }
}
