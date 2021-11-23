// Rules common to JavaScript and TypeScript files.
/** @type {import('eslint').Linter.Config['rules']} */
const commonRules = {
  // Changed all from 'never'.
  'comma-dangle': ['error', {
    arrays: 'always-multiline',
    objects: 'always-multiline',
    imports: 'always-multiline',
    exports: 'always-multiline',
    functions: 'only-multiline',
  }],
  'linebreak-style': ['error', 'unix'],
  'max-len': ['warn', {
    code: 120,
    tabWidth: 2,
    ignoreUrls: true,
  }],
  // Changed from error to warn and enabled ignoreEOLComments.
  'no-multi-spaces': ['warn', {
    ignoreEOLComments: true,
  }],
  // Changed from error to warn and adjusted options.
  'no-multiple-empty-lines': ['warn', {
    max: 2,
    maxEOF: 1,
    maxBOF: 1,
  }],
  // Changed from error to off.
  'no-template-curly-in-string': 'off',
  // Changed from 'after' to 'before'.
  'operator-linebreak': ['error', 'before'],
  // Changed from error and all 'never' to warn and switches 'never'.
  'padded-blocks': ['warn', {
    switches: 'never',
  }],
  // Changed from 'as-needed' to 'consistent-as-needed'.
  'quote-props': ['error', 'consistent-as-needed'],
  // Changed from error to warn and added exceptions.
  'spaced-comment': ['warn', 'always', {
    exceptions: ['-', '*', '/', '='],
  }],
}

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'standard',
  ],
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    '/dist/',
    '**/node_modules/',
    '.eslintrc.js'
  ],
  rules: commonRules,
  overrides: [
    // All TypeScript files.
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
      },
      settings: {
        'import/resolver': {
          // Use eslint-import-resolver-typescript to obey "paths" in tsconfig.json.
          typescript: {
            project: 'tsconfig.json',
          },
        },
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'standard-with-typescript',
        'plugin:import/recommended',
        'plugin:import/typescript',
      ],
      rules: {
        ...commonRules,
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        // Some packages have wrong type declarations.
        'import/default': 'off',
        'import/newline-after-import': ['error', { 'count': 2 }],
        // This rule disallows using both wildcard and selective imports from the same module.
        'import/no-duplicates': 'off',
        // Some packages have it wrong in type declarations (e.g. katex, marked).
        'import/no-named-as-default-member': 'off',
        // Disabled because I don't see any benefit in it. (roustomas)
        'import/no-named-as-default': 'off',
        // Disabled because I don't see any benefit in it. (roustomas)
        '@typescript-eslint/array-type': 'off',
        // Changed options.
        '@typescript-eslint/ban-types': ['error', {
        // Allow to use {} and object - they are actually useful.
          types: {
            '{}': false,
            'object': false,
          },
          extendDefaults: true,
        }],
        '@typescript-eslint/class-literal-property-style': ['error', 'fields'],
        // Change objectLiteralTypeAssertions from 'never' to 'allow'; it's needed and
        // completely legit in some cases, e.g. in Array#reduce.
        '@typescript-eslint/consistent-type-assertions': ['error', {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        }],
        // Changed from error to off.
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/explicit-member-accessibility': ['error', {
          accessibility: 'no-public',
          overrides: {
            parameterProperties: 'off',
          },
        }],
        // Changed from warn to error and adjusted options.
        '@typescript-eslint/explicit-module-boundary-types': ['error', {
          allowArgumentsExplicitlyTypedAsAny: true,
        }],
        '@typescript-eslint/indent': ['error', 2, {
          SwitchCase: 1,
          VariableDeclarator: 1,
          outerIIFEBody: 1,
          MemberExpression: 1,
          // Changed parameters from 1 to off.
          FunctionDeclaration: { parameters: 'off', body: 1 },
          // Changed parameters from 1 to off.
          FunctionExpression: { parameters: 'off', body: 1 },
          // Changed arguments from 1 to off.
          CallExpression: { arguments: 'off' },
          ArrayExpression: 1,
          ObjectExpression: 1,
          ImportDeclaration: 1,
          // Changed from false to true.
          flatTernaryExpressions: true,
          ignoreComments: false,
        }],
        // Changed from error to warn.
        '@typescript-eslint/lines-between-class-members': 'warn',
        // Changed delimiter for type literals from none to comma.
        // The reason is just aesthetic symmetry with object literals.
        '@typescript-eslint/member-delimiter-style': ['error', {
          multiline: { delimiter: 'comma', requireLast: true },
          singleline: { delimiter: 'comma', requireLast: false },
          overrides: {
            interface: {
              multiline: { delimiter: 'none' },
            },
          },
        }],
        '@typescript-eslint/member-ordering': 'warn',
        // Changed from error to warn - property with function type is not usable
        // for function overloading.
        '@typescript-eslint/method-signature-style': 'warn',
        // Changed from error to warn.
        '@typescript-eslint/no-extra-semi': 'warn',
        // It disallows using void even in valid cases.
        '@typescript-eslint/no-invalid-void-type': 'off',
        // Changed from error to warn.
        '@typescript-eslint/no-namespace': 'warn',
        // Changed from error to warn.
        '@typescript-eslint/no-non-null-assertion': 'warn',
        // Changed from error to warn.
        // Legitimit violations:
        // - When we create a string union using typescript-string-enums (or even
        //   DIY), then we want to export the object of const strings as a type
        //   with the same name.
        '@typescript-eslint/no-redeclare': 'warn',
        '@typescript-eslint/no-require-imports': 'error',
        // Changed from error to warn.
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        // Changed from error to warn.
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        // Disabled in favour of the next rule.
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars-experimental': 'error',
        // Changed options.
        '@typescript-eslint/no-use-before-define': ['error', {
          functions: false,
          typedefs: false,
        }],
        '@typescript-eslint/prefer-enum-initializers': 'error',
        '@typescript-eslint/prefer-for-of': 'warn',
        // Changed from error to warn.
        '@typescript-eslint/prefer-includes': 'warn',
        // In some cases reduce type parameter is not sufficient.
        '@typescript-eslint/prefer-reduce-type-parameter': 'off',
        // Changed from error to warn.
        '@typescript-eslint/prefer-regexp-exec': 'warn',
        '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
        // It has too many false positives.
        '@typescript-eslint/restrict-template-expressions': 'off',
        // Changed from error to off.
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        // It doesn't correctly distinguish between methods and plain functions
        // (even when ignoreStatic is enabled), e.g. in Lodash.
        '@typescript-eslint/unbound-method': 'off'
      },
    }
  ]
};
