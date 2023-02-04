import styles from "rollup-plugin-styles";
const autoprefixer = require('autoprefixer');
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel';
import nodePolyfills from 'rollup-plugin-node-polyfills';

// the entry point for the library
const input = 'src/index.js'

//
var MODE = [
    {
        fomart: 'cjs'
    },
    {
        fomart: 'esm'
    },
    {
        fomart: 'umd'
    }
]




var config = []


MODE.map((m) => {
    var conf = {
        input: input,
        output: {
            // then name of your package
            name: "react-js-carplay",
            file: `dist/index.${m.fomart}.js`,
            format: m.fomart,
            exports: "auto"
        },
        // this externelizes react to prevent rollup from compiling it
        external: ["react", /@babel\/runtime/],
        plugins: [
            // these are babel comfigurations
            babel({
                exclude: 'node_modules/**',
                plugins: ['@babel/transform-runtime'],
                babelHelpers: 'runtime'
            }),
            // this adds support for styles
            styles({
                postcss: {
                    plugins: [
                        autoprefixer()
                    ]
                }
            }),
            nodePolyfills({include: null})
        ]
    }
    config.push(conf)
})

export default [
    ...config,
]