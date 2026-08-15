import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'


// Formatting rules, kept equivalent to the previous `standard` / `standard-with-typescript`
// setup so the migration does not reformat the whole codebase.
const stylisticRules = {
  '@stylistic/arrow-spacing': 'error',
  '@stylistic/block-spacing': 'error',
  '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  '@stylistic/comma-dangle': ['error', {
    arrays: 'always-multiline',
    objects: 'always-multiline',
    imports: 'always-multiline',
    exports: 'always-multiline',
    functions: 'only-multiline',
  }],
  '@stylistic/comma-spacing': 'error',
  '@stylistic/eol-last': 'error',
  '@stylistic/indent': ['error', 2, {
    SwitchCase: 1,
    VariableDeclarator: 1,
    outerIIFEBody: 1,
    MemberExpression: 1,
    FunctionDeclaration: { parameters: 'off', body: 1 },
    FunctionExpression: { parameters: 'off', body: 1 },
    CallExpression: { arguments: 'off' },
    ArrayExpression: 1,
    ObjectExpression: 1,
    ImportDeclaration: 1,
    flatTernaryExpressions: true,
    ignoreComments: false,
    ignoredNodes: ['TSUnionType', 'TSIntersectionType'],
  }],
  '@stylistic/jsx-quotes': ['error', 'prefer-single'],
  '@stylistic/key-spacing': 'error',
  '@stylistic/keyword-spacing': 'error',
  '@stylistic/linebreak-style': ['error', 'unix'],
  '@stylistic/max-len': ['warn', {
    code: 120,
    tabWidth: 2,
    ignoreUrls: true,
  }],
  '@stylistic/member-delimiter-style': ['error', {
    multiline: { delimiter: 'comma', requireLast: true },
    singleline: { delimiter: 'comma', requireLast: false },
    overrides: {
      interface: {
        multiline: { delimiter: 'none' },
      },
    },
  }],
  '@stylistic/no-multi-spaces': ['warn', { ignoreEOLComments: true }],
  '@stylistic/no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 1, maxBOF: 1 }],
  '@stylistic/no-trailing-spaces': 'error',
  '@stylistic/object-curly-spacing': ['error', 'always'],
  '@stylistic/operator-linebreak': ['error', 'before'],
  '@stylistic/padded-blocks': ['warn', { switches: 'never' }],
  '@stylistic/quote-props': ['error', 'consistent-as-needed'],
  '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
  '@stylistic/semi': ['error', 'never'],
  '@stylistic/space-before-blocks': 'error',
  '@stylistic/space-before-function-paren': ['error', 'always'],
  '@stylistic/space-infix-ops': 'error',
  '@stylistic/spaced-comment': ['warn', 'always', { exceptions: ['-', '*', '/', '='] }],
}

export default tseslint.config(
  {
    // `.claude/**` holds the hooks of the AI development flow. They are plain node
    // scripts outside the tsconfig project, so the type-checked rules cannot run on
    // them - they have their own fixture tests instead (`.claude/hooks/tests/run.mjs`).
    ignores: ['build/**', 'node_modules/**', '.yarn/**', 'coverage/**', '.claude/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@stylistic': stylistic,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...stylisticRules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // new in eslint-plugin-react-hooks 7; flags long-standing patterns in the screens,
      // fixing them means restructuring components — kept visible as warnings for now
      'react-hooks/set-state-in-effect': 'warn',
      'no-template-curly-in-string': 'off',
      // `standard` allowed these, and the codebase leans on `cond && doThing()`
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@typescript-eslint/consistent-type-assertions': ['error', {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow',
      }],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/explicit-module-boundary-types': ['error', {
        allowArgumentsExplicitlyTypedAsAny: true,
      }],
      '@typescript-eslint/no-explicit-any': 'off',
      // successor of the old `ban-types` config, which explicitly allowed `{}`
      '@typescript-eslint/no-empty-object-type': ['error', {
        allowInterfaces: 'always',
        allowObjectTypes: 'always',
      }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unused-expressions': ['error', {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-use-before-define': ['error', {
        functions: false,
        typedefs: false,
      }],
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-includes': 'warn',
      '@typescript-eslint/prefer-regexp-exec': 'warn',
      '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}', 'src/setupTests.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['vite.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: { '@stylistic': stylistic },
    rules: {
      ...stylisticRules,
    },
  },
  {
    // this config file itself is plain JS and outside the TS project
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: { '@stylistic': stylistic },
    rules: {
      ...stylisticRules,
    },
  }
)
