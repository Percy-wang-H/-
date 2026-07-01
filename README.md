# 华商创新班成绩管理系统

一个面向课程成绩管理的静态 Web 系统，已内置 `23本计算机科学与技术（创新实验班）1-2班` 的综合成绩示例数据。

## 功能

- Excel 成绩表导入，支持 `.xlsx`、`.xls`、`.csv`
- 综合成绩总览：人数、平均分、最高分、及格率
- 学生成绩表格：搜索、排序、新增、编辑、删除
- 统计图表：综合成绩分布、各项成绩平均值
- CSV 导出
- 作业提交文字生成：GitHub 链接、公网链接、功能说明

## 本地运行

直接用浏览器打开 `index.html` 即可。

如果需要通过本地服务访问：

```bash
python -m http.server 8080
```

然后访问：

```text
http://localhost:8080
```

## 文件结构

```text
grade-system/
├── index.html
├── styles.css
├── app.js
├── sample-data.js
├── README.md
└── DEPLOYMENT.md
```

## 技术说明

- 前端：HTML、CSS、JavaScript
- 图标：Lucide
- Excel 解析：SheetJS
- 图表：Canvas 自绘

