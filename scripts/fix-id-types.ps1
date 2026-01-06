# Script para corrigir tipos de ID de string para number

$files = Get-ChildItem -Path "../src" -Recurse -Include "*.ts" -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Substituições comuns
    $content = $content -replace 'userId: string', 'userId: number'
    $content = $content -replace 'postId: string', 'postId: number'
    $content = $content -replace 'desafioId: string', 'desafioId: number'
    $content = $content -replace 'conquistaId: string', 'conquistaId: number'
    $content = $content -replace 'followerId: string', 'followerId: number'
    $content = $content -replace 'followingId: string', 'followingId: number'
    $content = $content -replace 'id: string', 'id: number'

    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "✅ Tipos de ID corrigidos!"
