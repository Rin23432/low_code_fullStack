# 占位脚本：仅打印将启动的服务，不实际执行启动。
# TODO: 后续增加并行启动与健康检查。

$services = @(
  @{ Name = 'apps/mock'; Command = 'npm run dev' },
  @{ Name = 'apps/low_code'; Command = 'npm start' },
  @{ Name = 'apps/low_code_c'; Command = 'npm run dev' }
)

Write-Host 'Planned services to start:' -ForegroundColor Cyan
foreach ($svc in $services) {
  Write-Host ("- {0} -> {1}" -f $svc.Name, $svc.Command)
}
