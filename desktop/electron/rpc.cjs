const { spawn } = require('node:child_process');
const { createInterface } = require('node:readline');

class HostClient {
  constructor(runtime, assembly, dataDirectory) {
    this.pending = new Map(); this.serial = 0; this.diagnostic = '';
    this.child = spawn(runtime, [assembly, dataDirectory], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true,
      env: { ...process.env, DOTNET_MULTILEVEL_LOOKUP: '0', DOTNET_ROLL_FORWARD: 'LatestPatch', DOTNET_CLI_TELEMETRY_OPTOUT: '1' } });
    this.child.stderr.on('data', data => { this.diagnostic = (this.diagnostic + data).slice(-4096); });
    createInterface({ input: this.child.stdout }).on('line', line => {
      try {
        const message = JSON.parse(line), job = this.pending.get(message.id);
        if (job) { clearTimeout(job.timer); this.pending.delete(message.id); job.resolve(message.result); }
      } catch (error) { this.fail(error); }
    });
    this.child.on('error', error => this.fail(error));
    this.child.on('exit', code => this.fail(new Error(`工程服务已退出（${code}）。${this.diagnostic}`)));
  }
  call(method, args = []) {
    if (this.failure) return Promise.reject(this.failure);
    return new Promise((resolve, reject) => {
      const id = ++this.serial;
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('工程服务响应超时，请保留当前窗口并重试。')); }, 120000);
      this.pending.set(id, { resolve, reject, timer });
      this.child.stdin.write(JSON.stringify({ id, method, args }) + '\n', error => { if (error) this.fail(error); });
    });
  }
  fail(error) {
    this.failure = error;
    for (const job of this.pending.values()) { clearTimeout(job.timer); job.reject(error); }
    this.pending.clear();
  }
  close() { this.child.stdin.end(); }
}
module.exports = { HostClient };
