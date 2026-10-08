# testar-associacao.ps1
# Roda os testes da associação produto-fornecedor e salva tudo em resultado-testes.txt
# (o servidor precisa estar ligado com "node app.js" em outro terminal)

$base = "http://localhost:3000"
$saida = Join-Path $PSScriptRoot "resultado-testes.txt"

"Resultado dos testes - $(Get-Date)" | Out-File -FilePath $saida -Encoding utf8

function Testar($titulo, $metodo, $caminho, $corpo) {
    Add-Content -Path $saida -Value "" -Encoding utf8
    Add-Content -Path $saida -Value "=== $titulo ===" -Encoding utf8
    try {
        if ($corpo) {
            $r = Invoke-RestMethod -Uri "$base$caminho" -Method $metodo -ContentType "application/json" -Body $corpo
        } else {
            $r = Invoke-RestMethod -Uri "$base$caminho" -Method $metodo
        }
        Add-Content -Path $saida -Value "OK:" -Encoding utf8
        Add-Content -Path $saida -Value (ConvertTo-Json -InputObject $r -Depth 5) -Encoding utf8
    } catch {
        $msg = $_.ErrorDetails.Message
        if (-not $msg) { $msg = $_.Exception.Message }
        Add-Content -Path $saida -Value "ERRO: $msg" -Encoding utf8
    }
}

Testar "0a - Produtos cadastrados" "Get" "/produtos" $null
Testar "0b - Fornecedores cadastrados" "Get" "/fornecedores" $null
Testar "1 - Associar produto 1 ao fornecedor 1 (esperado: OK, id novo)" "Post" "/associacoes" '{"produto_id":1,"fornecedor_id":1}'
Testar "2 - Repetir a mesma associacao (esperado: ERRO, ja associado)" "Post" "/associacoes" '{"produto_id":1,"fornecedor_id":1}'
Testar "3 - Produto inexistente (esperado: ERRO, produto nao encontrado)" "Post" "/associacoes" '{"produto_id":999,"fornecedor_id":1}'
Testar "4 - Fornecedores do produto 1 (esperado: Distribuidora Teste)" "Get" "/produtos/1/fornecedores" $null
Testar "5 - Todas as associacoes (esperado: Arroz 5kg + Distribuidora Teste)" "Get" "/associacoes" $null

Write-Host "Pronto! Resultado salvo em: $saida"
