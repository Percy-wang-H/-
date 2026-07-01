# GitHub 与阿里云部署说明

## 1. 发布到 GitHub

```bash
git init
git add .
git commit -m "init grade management system"
git branch -M main
git remote add origin https://github.com/你的用户名/grade-management-system.git
git push -u origin main
```

完成后，仓库链接示例：

```text
https://github.com/你的用户名/grade-management-system
```

## 2. GitHub Pages 部署

1. 打开 GitHub 仓库。
2. 进入 `Settings`。
3. 选择 `Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main`，目录选择 `/root`。
6. 保存后等待部署完成。

访问链接通常形如：

```text
https://你的用户名.github.io/grade-management-system/
```

## 3. 阿里云服务器部署

登录服务器后安装 Nginx：

```bash
sudo yum install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

上传项目文件到服务器：

```bash
scp -r grade-system/* root@服务器公网IP:/usr/share/nginx/html/
```

放行安全组端口：

```text
80
```

浏览器访问：

```text
http://服务器公网IP/
```

## 4. 作业提交模板

```text
综合项目：华商创新班成绩管理系统
GitHub 链接：https://github.com/你的用户名/grade-management-system
公网访问链接：http://服务器公网IP/
系统功能：Excel 导入、成绩统计、图表展示、学生成绩增删改查、CSV 导出。
```

