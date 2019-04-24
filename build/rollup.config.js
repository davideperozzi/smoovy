import path from 'path';
import autoExternal from 'rollup-plugin-auto-external';
import localResolve from 'rollup-plugin-local-resolve';
import { terser } from "rollup-plugin-terser";
import typescript from 'rollup-plugin-typescript2';

const pkgPath = process.env.PACKAGE;
const pkgConfigPath = path.join(pkgPath, 'package.json');
const pkgConfig = require(pkgConfigPath);
const inputFile = path.resolve(pkgPath, pkgConfig.source);
const outputPath = path.dirname(path.resolve(pkgPath, pkgConfig.main));
const outputType = path.extname(pkgConfig.main).replace(/^\./, '');
const outputName = path.basename(pkgConfig.main)
  .replace(new RegExp(`\.${outputType}$`), '');

const defaultExternals = (id) => {
  return autoExternal({ packagePath: pkgConfigPath})
  .options({ external: [] })
  .external
  .includes(id);
}

const defaultPlugins = [
  typescript({
    useTsconfigDeclarationDir: true,
    tsconfigDefaults: {
      exclude: [ 'node_modules', 'tests', '__tests__', 'demos', 'dist' ],
      compilerOptions: {
        declaration: true,
        declarationDir: pkgConfig.types ? path.dirname(pkgConfig.types) : ''
      }
    },
    tsconfig: path.resolve(pkgPath, 'tsconfig.json'),
  }),
  localResolve(),
  terser({
    compress: {
      passes: 3
    }
  })
];

const cjsConfig = {
  format: 'cjs',
  file: path.join(outputPath, `${outputName}.${outputType}`),
  sourcemap: true
};

const esmConfig = {
  format: 'esm',
  file: path.join(outputPath, `${outputName}.m${outputType}`),
  sourcemap: true
};

const umdConfig = {
  format: 'umd',
  file: path.join(outputPath, `${outputName}.umd.${outputType}`),
  name: pkgConfig.name,
  sourcemap: true,
  globals: {
    tslib: 'tslib'
  }
};

export default Promise.resolve(
  [
    cjsConfig,
    esmConfig,
    umdConfig
  ].map(
    output => ({
      input: inputFile,
      context: 'window',
      external: defaultExternals,
      plugins: [ ...defaultPlugins ],
      output,
    })
  )
);
