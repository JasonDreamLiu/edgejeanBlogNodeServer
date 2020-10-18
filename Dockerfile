# 手动安装node环境，达到压缩镜像大小的效果
FROM alpine AS builder
WORKDIR /Server/node
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk add --no-cache --update nodejs nodejs-npm
COPY package.json package-lock.json ./
RUN npm install --production

FROM alpine
# 默认运行路径
WORKDIR /Server/express
# 安装node
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk add --no-cache --update nodejs nodejs-npm
COPY --from=builder /Server/node/node_modules ./node_modules
# 将当前文件保存image的路径
COPY . .

# 自动安装所需依赖
RUN npm install
# 映射端口
EXPOSE 3000
ENTRYPOINT ["npm", "run"]
# 部署后自动运行脚本
CMD ["start"]