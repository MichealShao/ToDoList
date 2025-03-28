#!/bin/bash

# 获取提交信息
echo "请输入提交信息:"
read commit_message

# 如果没有输入提交信息，使用默认信息
if [ -z "$commit_message" ]; then
    commit_message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 执行 git 命令
git add .
git commit -m "$commit_message"
git push

echo "✅ 代码已成功推送到远程仓库" 