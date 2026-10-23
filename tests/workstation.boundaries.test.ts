/** 新工作站的静态边界检查：node tests/workstation.boundaries.test.ts。 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { isBuiltin } from 'node:module';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workstationRoot = resolve(projectRoot, 'src/workstation');
const modulesRoot = resolve(workstationRoot, 'modules');
const requiredModules = ['materials', 'sound-runtime', 'timbre', 'phrase', 'song', 'co-creation', 'sampling', 'melody-recognition', 'ui-rendering'];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mts', '.mjs', '.cts', '.cjs']);

function sourceFiles(directory: string): string[] {
  if (!existsSync(directory) || !statSync(directory).isDirectory()) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolute = resolve(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(absolute)
      : sourceExtensions.has(extname(entry.name)) ? [absolute] : [];
  });
}

function inside(file: string, directory: string): boolean {
  const path = relative(directory, file);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
}

function display(file: string): string {
  return relative(projectRoot, file).replaceAll(sep, '/');
}

function moduleName(file: string): string | undefined {
  if (!inside(file, modulesRoot)) return undefined;
  const path = relative(modulesRoot, file).split(sep);
  return path.length > 1 ? path[0] : undefined;
}

function isContract(file: string): boolean {
  return file === resolve(workstationRoot, 'contracts.ts')
    || inside(file, resolve(workstationRoot, 'contracts'));
}

assert.ok(existsSync(workstationRoot), '缺少 src/workstation，不能以空目录通过边界检查');
const files = sourceFiles(workstationRoot);
assert.ok(files.length > 0, 'src/workstation 没有源文件，不能通过边界检查');
assert.ok(files.some(isContract), '缺少公共 contracts 源文件');
assert.ok(files.some(file => file === resolve(workstationRoot, 'app.ts')
  || inside(file, resolve(workstationRoot, 'app'))), '缺少工作站 app 源文件');
for (const name of requiredModules) {
  const directory = resolve(modulesRoot, name);
  assert.ok(sourceFiles(directory).length > 0, `缺少模块 ${name} 的源文件`);
  assert.ok(existsSync(resolve(directory, 'public.ts')), `模块 ${name} 缺少 public.ts 公共入口`);
}
for (const entry of readdirSync(modulesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const directory = resolve(modulesRoot, entry.name);
  assert.ok(sourceFiles(directory).length > 0, `模块 ${entry.name} 没有源文件`);
  assert.ok(existsSync(resolve(directory, 'public.ts')), `模块 ${entry.name} 缺少 public.ts 公共入口`);
}

const configPath = ts.findConfigFile(projectRoot, ts.sys.fileExists, 'tsconfig.json');
assert.ok(configPath, '缺少 tsconfig.json，无法按项目实际路径解析规则检查');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
assert.equal(config.error, undefined, 'tsconfig.json 读取失败');
const parsedConfig = ts.parseJsonConfigFileContent(config.config, ts.sys, projectRoot);
assert.equal(parsedConfig.errors.length, 0, 'tsconfig.json 解析失败');

const violations: string[] = [];
let importsChecked = 0;

function checkImport(file: string, node: ts.Node, expression: ts.Expression | ts.TypeNode | undefined): void {
  const source = node.getSourceFile();
  const location = source.getLineAndCharacterOfPosition(node.getStart());
  const label = `${display(file)}:${location.line + 1}`;
  if (!expression || !ts.isStringLiteralLike(expression)) {
    violations.push(`${label} 使用无法静态确认目标的模块加载，不能验证模块边界`);
    return;
  }
  importsChecked++;
  const specifier = expression.text;
  if (isBuiltin(specifier)) return;
  const resolution = ts.resolveModuleName(specifier, file, parsedConfig.options, ts.sys).resolvedModule;
  const localAsset = specifier.startsWith('.') ? resolve(dirname(file), specifier) : undefined;
  const target = resolution ? resolve(resolution.resolvedFileName)
    : localAsset && existsSync(localAsset) && statSync(localAsset).isFile() ? localAsset : undefined;
  if (!target) {
    violations.push(`${label} 无法解析 ${JSON.stringify(specifier)}，不能确认其边界`);
    return;
  }
  // 独立安装的库不属于业务模块；项目源码不能借路径别名越过新旧边界。
  if (inside(target, resolve(projectRoot, 'node_modules'))) return;
  if (!inside(target, workstationRoot)) {
    violations.push(`${label} 引用了新工作站之外的源码 ${display(target)}`);
    return;
  }
  if (isContract(file)) {
    if (!isContract(target)) violations.push(`${label} 公共 contracts 依赖了具体实现 ${display(target)}`);
    return;
  }
  const fromModule = moduleName(file);
  const toModule = moduleName(target);
  if (fromModule && fromModule === toModule) return;
  if (isContract(target)) return;
  if (toModule) {
    if (target !== resolve(modulesRoot, toModule, 'public.ts')) {
      violations.push(`${label} 越过 ${toModule}/public.ts 访问了 ${display(target)}`);
    }
    return;
  }
  if (fromModule) violations.push(`${label} 模块反向依赖了应用组织层 ${display(target)}`);
}

for (const file of files) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier) checkImport(file, node, node.moduleSpecifier);
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      checkImport(file, node, node.moduleReference.expression);
    } else if (ts.isImportTypeNode(node)) {
      checkImport(file, node, ts.isLiteralTypeNode(node.argument) ? node.argument.literal : undefined);
    } else if (ts.isCallExpression(node)
      && (node.expression.kind === ts.SyntaxKind.ImportKeyword
        || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      checkImport(file, node, node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

assert.equal(violations.length, 0, `新工作站模块边界违规：\n${violations.join('\n')}`);
console.log(`✓ 新工作站边界通过：${files.length} 个源文件，${importsChecked} 处静态模块引用`);
