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

| Output   | Description                          |
| -------- | ------------------------------------ |
| `valid`  | Whether the JSON file(s) are valid.  |
| `errors` | The validation errors for each file. |

## Schema Input Behavior

The schema input is optional and can be omitted during the validation process.
If the `schema` input is not provided, the action will perform a basic
validation to ensure that the JSON files have the correct format. This basic
validation checks for common JSON syntax errors and structure.

However, it's **highly recommended to provide a custom JSON Schema** using the
`schema` input. A custom JSON Schema allows you to define specific validation
rules tailored to your JSON files. By using a custom JSON Schema, you can ensure
that your JSON files adhere to your desired structure and requirements.

## About

This action uses [ajv](https://ajv.js.org/) to validate JSON files.

## License

The action in this repository is licensed under the
[MIT License](https://github.com/emmanuelgautier/validate-json/blob/main/LICENSE)@
[Emmanuel Gautier](https://www.emmanuelgautier.com/).
