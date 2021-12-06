module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    page: true,
    REACT_APP_ENV: true,
  },
  rules: {
    'no-empty-function': [2, { allow: ['constructors'] }],
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/no-explicit-any': [0],
    '@typescript-eslint/array-type': 0,
    '@typescript-eslint/no-unused-vars': [2],
    'react/static-property-placement': [0],
    'react/state-in-constructor': [0],
    'react/jsx-props-no-spreading': [0],
    'no-unused-expressions': [0],
    'react-hooks/rules-of-hooks': 'error', // hooks
    'react-hooks/exhaustive-deps': 'error', // hooks
    'prefer-destructuring': [0], // 不强制使用解构赋值
    'arrow-parens': [0],
    'space-before-function-paren': [0],
    'generator-star-spacing': [0], // 该规则规定了generator函数中星号两边的空白。
    'consistent-return': [0],
    'react/forbid-prop-types': [0], // 禁止某些propTypes
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'react/jsx-indent': [0, 2, { checkAttributes: true, indentLogicalExpressions: true }], //验证JSX中的缩进
    'global-require': [1],
    'import/prefer-default-export': [0],
    'react/jsx-no-bind': [0], //JSX中不允许使用箭头函数和bind
    'react/prop-types': [0], //防止在React组件定义中丢失props验证
    'react/prefer-stateless-function': [0],
    'react/jsx-one-expression-per-line': [0],
    'react/no-did-update-set-state': [0],
    'max-len': ['error', { code: 150 }], //强制执行最大行长度
    'react/jsx-wrap-multilines': [
      'error',
      {
        declaration: 'parens-new-line',
        assignment: 'parens-new-line',
        return: 'parens-new-line',
        arrow: 'parens-new-line',
        condition: 'parens-new-line',
        logical: 'parens-new-line',
        prop: 'ignore',
      },
    ],
    'react/require-default-props': [0],
    'react/default-props-match-prop-types': [0],
    'react/no-unused-prop-types': [0],
    'no-else-return': [0],
    'no-restricted-syntax': [0],
    'import/no-extraneous-dependencies': [0],
    'no-use-before-define': [0], //未定义前不能使用
    'jsx-a11y/heading-has-content': [0],
    'jsx-a11y/anchor-has-content': [0],
    'jsx-a11y/no-static-element-interactions': [0],
    'jsx-a11y/no-noninteractive-element-interactions': [0],
    'jsx-a11y/click-events-have-key-events': [0],
    'jsx-a11y/anchor-is-valid': [0],
    'jsx-a11y/label-has-associated-control': [0],
    'no-nested-ternary': [0],
    'arrow-body-style': [0],
    'import/extensions': [0],
    'no-bitwise': [0],
    'no-cond-assign': [0],
    'no-underscore-dangle': [0],
    'no-param-reassign': ['error', { props: false }],
    'import/no-unresolved': [0],
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
      },
    ], // 对象字面量项尾不能有逗号
    'object-curly-newline': [0],
    'function-paren-newline': [0],
    'no-restricted-globals': [0],
    'require-yield': [1], //生成器函数必须有yield
    'linebreak-style': 'off', // 换行符
    semi: [0, 'always'],
  },
  settings: {
    'import/resolver': { node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] } }
  },
};
