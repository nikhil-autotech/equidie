'use strict';

module.exports = {
    'diff': true,
    'extension': ['js'],
    'package': './package.json',
    'reporter': 'spec',
    'recursive': true,
    'slow': 75,
    'timeout': 100000,
    'spec': ['./test/curriculum.test.js'],
    'color' : true,
    'asyncOnly' : true,
    'bail': true,
    'ignore': ['node_modules', 'docs', 'db-migrations', '.vscode', 'jobs']
}