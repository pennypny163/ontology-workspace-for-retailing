FROM python:3.11-slim

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# 安装 Python 依赖（包含 nodeenv）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 通过 nodeenv 安装 Node.js（纯 Python 方式，不需要 apt-get）
RUN nodeenv --prebuilt --node=18.20.4 /opt/node
ENV PATH="/opt/node/bin:$PATH"

# 复制全部项目文件
COPY . .

# 构建前端
RUN npm install && npm run build

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--limit-max-request-size", "104857600"]
