$runningServices = Get-Service | Where-Object {
    $_.Status -eq "Running" 
}
foreach ($svc in $runningServices){

    Write-Host " service :" $svc ""
}