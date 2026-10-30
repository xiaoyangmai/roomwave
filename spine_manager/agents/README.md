# Agent Roles

这些不是项目内可启动的后台进程，而是 Codex 主代理使用的委派模板。主代理通过 `collaboration.spawn_agent` 临时创建专家任务，并把本次 run 的证据路径、只读范围和完成标准写进任务说明。

第一版只实现最小角色集合：

- `forensic`: 只读取证；
- `rig-architect`: 生成语义契约和可回滚计划；
- `executor`: 执行已生成的计划；
- `validator`: 运行确定性检查；
- `reviewer`: 只看证据包；
- `learning-curator`: 整理重复失败。

角色之间通过 `runs/<run-id>/` 下的结构化产物通信。默认所有角色只读，禁止修改 `source/`、共享派生目录或其他角色的报告。禁止用隐含的对话状态代替产物；报告必须区分 `FACT`、`INFERENCE`、`UNKNOWN`，并带 `evidence_refs`。
