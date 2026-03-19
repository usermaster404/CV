# Admin check
if (-not ([Security.Principal.WindowsPrincipal]    [Security.Principal.WindowsIdentity]::GetCurrent()
).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Run this as Administrator." -ForegroundColor Red
    exit
}

# === CORE ALLOWLIST ===
$allowedServices = @(
    "RpcSs",        # Remote Procedure Call (DO NOT STOP)
    "DcomLaunch",   # DCOM Server Process Launcher
    "PlugPlay",     # Plug and Play
    "Power",        # Power service
    "Winmgmt",      # WMI
    "EventLog",     # Windows Event Log
    "SamSs",        # Security Accounts Manager
    "LSM",          # Local Session Manager
    "ProfSvc",      # User Profile Service
    "UserManager", # User Manager
    "Schedule",    # Task Scheduler (needed internally)
    "Themes",      # Prevents black screen
    "AudioSrv",    # Optional but avoids audio hangs
    "Audiosrv",    # (case-safe)
    "ShellHWDetection",
    "AppInfo",     # UAC
    "Winlogon",
    "gpsvc",       # Group Policy
    "CryptSvc",    # Crypto
    "W32Time",     # Time service
    "BFE",         # Required for system stability
    "mpssvc"       # Windows Firewall (safe to keep) 
    ,"nsi"                 # Network Store Interface
"Dhcp  "              # IP address assignment
"Dnscache"            # DNS resolution
"NlaSvc"              # Network Location Awareness
"Netman"              # Network Connections
"BFE"                 # Base Filtering Engine
"mpssvc"              # Windows Firewall
"WinHttpAutoProxySvc" # Web connectivity support

    
)

Write-Host "`nEntering ULTRA-MINIMAL MODE..." -ForegroundColor Cyan

# Get all running services except allowed ones
$runningServices = Get-Service | Where-Object {
    $_.Status -eq "Running" -and
    $allowedServices -notcontains $_.Name
}

foreach ($svc in $runningServices) {
    try {
        Stop-Service -Name $svc.Name -Force -ErrorAction Stop
        Write-Host "Stopped: $($svc.Name)"
    } catch {
        Write-Host "Skipped (protected): $($svc.Name)" -ForegroundColor Yellow
    }
}

Write-Host "`nSystem is now in ULTRA-MINIMAL state." -ForegroundColor Green
Write-Host "Only core services are running."
Write-Host "REBOOT to fully restore."











































####################################################################################################################################################################################################################################
#MALWAREBYTES
####################################################################################################################################################################################################################################

$ErrorActionPreference = "Stop"

# URLs and paths
$InstallerUrl = "https://downloads.malwarebytes.com/file/mb4_offline"
$InstallerPath = "$env:TEMP\MBSetup.exe"
$MbamPath = "C:\Program Files\Malwarebytes\Anti-Malware\mbam.exe"

Write-Host "Downloading Malwarebytes installer..."
Invoke-WebRequest -Uri $InstallerUrl -OutFile $InstallerPath

Write-Host "Installing Malwarebytes..."
Start-Process -FilePath $InstallerPath -ArgumentList "/SP- /VERYSILENT /NORESTART" -Wait

# Wait for Malwarebytes to finish installing
Write-Host "Waiting for Malwarebytes executable..."
while (-not (Test-Path $MbamPath)) {
    Start-Sleep -Seconds 5
}

Write-Host "Updating Malwarebytes definitions..."
Start-Process -FilePath $MbamPath -ArgumentList "/update" -Wait

Write-Host "Starting FULL scan (this may take a long time)..."
Start-Process -FilePath $MbamPath -ArgumentList "/scan -full" -Wait

Write-Host "Scan completed."
Write-Host "Logs can be found here:"
Write-Host "C:\ProgramData\Malwarebytes\MBAMService\logs"
 

Write-Host "Uninstalling Malwarebytes..."

$MbamExe = "C:\Program Files\Malwarebytes\Anti-Malware\mbam.exe"

if (Test-Path $MbamExe) {
    Start-Process -FilePath $MbamExe -ArgumentList "/uninstall /quiet" -Wait
    Write-Host "Malwarebytes uninstall initiated."
} else {
    Write-Host "Malwarebytes executable not found. It may already be uninstalled."
}

Write-Host "Waiting for Malwarebytes to be fully removed..."

while (Test-Path "C:\Program Files\Malwarebytes") {
    Start-Sleep -Seconds 5
}

Write-Host "Malwarebytes has been fully uninstalled."



















####################################################################################################################################################################################################################################
#
####################################################################################################################################################################################################################################
