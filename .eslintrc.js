module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "jest": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 9
    },
    "rules": {
        "arrow-spacing": [
            "error", { "before": true, "after": true }
        ],
        "eqeqeq": "error",
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "no-console": 0,
        "no-trailing-spaces": "error",
        "object-curly-spacing": [
            "error", "always"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ]
    }
};
