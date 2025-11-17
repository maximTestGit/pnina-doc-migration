# DOCUMENT 1 -- GOOGLE CLOUD PROJECT SETUP

## 1. Overview

This document defines the complete setup of the Google Cloud project
required for the application, including authentication, APIs, Cloud
Functions Gen2, service accounts, and configuration.

## 2. Creating the Google Cloud Project

-   Create a new project in Google Cloud Console.
-   Record the Project ID.

## 3. OAuth Consent Screen

-   Configure External OAuth consent screen.
-   Add Drive, Docs, Sheets, OpenID scopes.

## 4. OAuth Credentials

-   Create OAuth Client ID (Web Application).
-   Provide redirect URIs.
-   Save Client ID and Secret.

## 5. Required APIs

Enable: - Google Drive API - Google Docs API - Google Sheets API - Cloud
Functions API - Cloud Run API - Artifact Registry API - Cloud Build
API - Cloud Logging API - Cloud Storage API - Cloud Resource Manager
API - IAM Service Account Credentials API

## 6. Service Account Setup

-   Create service account.
-   Assign Drive Reader, Docs Reader, Sheets Editor, Cloud Functions
    Developer, Cloud Run Invoker roles.

## 7. Cloud Functions Gen2 Requirements

-   Runtime: Node.js 20
-   Trigger: HTTP
-   Configure memory, timeout, concurrency.

## 8. Environment Variables

-   Google Sheets IDs
-   Sheet tab names
-   Additional config values
