# Pnina Document Migration - Cloud Functions

This directory contains Google Cloud Functions (Gen 2) for the document migration project.

## Prerequisites

- Node.js 20
- Google Cloud CLI (`gcloud`)
- Google Cloud project configured

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Google Cloud:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

## Structure

- `functions/` - Cloud Functions code
- `package.json` - Node.js dependencies and configuration
- `.gcloudignore` - Files to exclude from deployment

## Deployment

Functions will be deployed using the Google Cloud CLI. Deployment commands will be added as functions are implemented.

## Development

Function implementations will be added to `functions/index.js`.
