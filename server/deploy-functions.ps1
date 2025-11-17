# Deploy all Cloud Functions to Google Cloud
# Run this script from the server directory

$PROJECT_ID = "pnina-doc-migration-2025"
$REGION = "us-central1"
$SHEETS_ID = "15_CGmvvlHcEjKGpFt7h8-yFLcWriMgt1LoVgWNWkqLs"
$SHEET_TAB = "ProcessedDocuments"

Write-Host "Deploying Cloud Functions to project: $PROJECT_ID" -ForegroundColor Green
Write-Host "Region: $REGION" -ForegroundColor Cyan
Write-Host ""

# Function 0: List Folders
Write-Host "Deploying Function 0: listFolders..." -ForegroundColor Yellow
gcloud functions deploy listFolders `
    --gen2 `
    --runtime=nodejs20 `
    --region=$REGION `
    --source=. `
    --entry-point=listFolders `
    --trigger-http `
    --allow-unauthenticated `
    --project=$PROJECT_ID

Write-Host "✓ Function 0 deployed" -ForegroundColor Green
Write-Host ""

# Function 1: List Documents
Write-Host "Deploying Function 1: listDocuments..." -ForegroundColor Yellow
gcloud functions deploy listDocuments `
    --gen2 `
    --runtime=nodejs20 `
    --region=$REGION `
    --source=. `
    --entry-point=listDocuments `
    --trigger-http `
    --allow-unauthenticated `
    --project=$PROJECT_ID

Write-Host "✓ Function 1 deployed" -ForegroundColor Green
Write-Host ""

# Function 2: Parse Document
Write-Host "Deploying Function 2: parseDocument..." -ForegroundColor Yellow
gcloud functions deploy parseDocument `
    --gen2 `
    --runtime=nodejs20 `
    --region=$REGION `
    --source=. `
    --entry-point=parseDocument `
    --trigger-http `
    --allow-unauthenticated `
    --project=$PROJECT_ID

Write-Host "✓ Function 2 deployed" -ForegroundColor Green
Write-Host ""

# Function 3: Save to Sheets
Write-Host "Deploying Function 3: saveToSheets..." -ForegroundColor Yellow
gcloud functions deploy saveToSheets `
    --gen2 `
    --runtime=nodejs20 `
    --region=$REGION `
    --source=. `
    --entry-point=saveToSheets `
    --trigger-http `
    --allow-unauthenticated `
    --set-env-vars GOOGLE_SHEETS_ID=$SHEETS_ID, SHEET_TAB_NAME=$SHEET_TAB `
    --project=$PROJECT_ID

Write-Host "✓ Function 3 deployed" -ForegroundColor Green
Write-Host ""

Write-Host "All functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Getting function URLs..." -ForegroundColor Cyan

# Get URLs
$url0 = gcloud functions describe listFolders --gen2 --region=$REGION --project=$PROJECT_ID --format="value(serviceConfig.uri)"
$url1 = gcloud functions describe listDocuments --gen2 --region=$REGION --project=$PROJECT_ID --format="value(serviceConfig.uri)"
$url2 = gcloud functions describe parseDocument --gen2 --region=$REGION --project=$PROJECT_ID --format="value(serviceConfig.uri)"
$url3 = gcloud functions describe saveToSheets --gen2 --region=$REGION --project=$PROJECT_ID --format="value(serviceConfig.uri)"

Write-Host ""
Write-Host "Function URLs:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Function 0 (listFolders):" -ForegroundColor Yellow
Write-Host $url0 -ForegroundColor Cyan
Write-Host ""
Write-Host "Function 1 (listDocuments):" -ForegroundColor Yellow
Write-Host $url1 -ForegroundColor Cyan
Write-Host ""
Write-Host "Function 2 (parseDocument):" -ForegroundColor Yellow
Write-Host $url2 -ForegroundColor Cyan
Write-Host ""
Write-Host "Function 3 (saveToSheets):" -ForegroundColor Yellow
Write-Host $url3 -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "Update your .env file with these URLs" -ForegroundColor Yellow
