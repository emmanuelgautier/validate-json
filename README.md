# Validate JSON GitHub Action

[![GitHub Super-Linter](https://github.com/emmanuelgautier/validate-json/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/emmanuelgautier/validate-json/actions/workflows/ci.yml/badge.svg)

A GitHub Action that validates JSON files with JSON Schema.

## Installation

To use this action, you need to create a workflow file in your repository. For
example, you can create a `.github/workflows/validate-json.yml` file with the
following content:

```yaml
name: Validate JSON

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate JSON
        uses: emmanuelgautier/validate-json@v1
        with:
          files: dir/*.json
          schema: schema.json
```

## Inputs

| Input    | Description                          | Required | Default |
| -------- | ------------------------------------ | -------- | ------- |
| `files`  | The JSON file(s) to validate.        | `true`   |         |
| `schema` | The JSON Schema to validate against. | `false`  |         |
| `strict` | Enforce strict validation.           | `false`  | `false` |

## Outputs

| Output  | Description                         |
| ------- | ----------------------------------- |
| `valid` | Whether the JSON file(s) are valid. |

## About

This action uses [ajv](https://ajv.js.org/) to validate JSON files.

## License

The action in this repository is licensed under the
[MIT License](https://github.com/emmanuelgautier/validate-json/blob/main/LICENSE)@
[Emmanuel Gautier](https://www.emmanuelgautier.com/).
