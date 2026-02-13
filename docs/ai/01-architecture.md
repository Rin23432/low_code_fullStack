AI Documents

1. AI_CONTEXT.md：项目目标与AI协作规则
   项目目标：
   “CodeCap” 项目旨在从零构建一个低代码全栈问卷系统，包括问卷的可视化编辑、问卷发布与答题，以及数据统计分析[1]。通过微前端和微服务架构，实现前后端解耦，支持多人协作开发，并为后续扩展真实后端服务奠定基础。项目的最终目标是交付一个可运行、易维护、易扩展的低代码问卷平台，同时总结一套工程实践经验。
   AI 协作原则：

- 人机分工： 开发者专注于需求拆解、架构设计和结果验收，AI（如 Codex）负责根据指令编写代码和文档。AI 作为“对双编程”中的助手，提供实现思路和初步代码，由开发者评审改进。
- 先规划后编码： 每次由开发者提出明确任务或问题，让 AI 先给出计划步骤或伪代码[2]，确认无误后再让 AI 生成具体实现。避免一步到位的大段代码，降低出错成本。
- 迭代优化： 初版实现完成后，由开发者测试验证，再引导 AI 优化性能、代码风格或补充注释。鼓励 AI 总结本次改动的目的和影响，确保人机对齐理解。
  角色定义：
- 开发者（人类）： 项目 Owner，与领域知识专家。负责提出需求、校准 AI 输出、集成代码以及最终部署。开发者制定代码规范和上下文信息，确保 AI 输出符合项目要求。
- AI 助理（Codex）： 虚拟对程序员，扮演资深全栈工程师的角色。根据上下文和协作规则，提供代码片段、文档说明等输出。AI 助理遵循项目规范，优先参考提供的项目文档和示例，遵守既定编码风格和模块边界。
- 上下文/环境： VS Code 开发环境，启用了 CodeCap AI 扩展。AI_CONTEXT.md 文件在 IDE 中固定(pinned)，AI 助理必须先阅读其中列出的技能库和文档，然后再回答开发者的问题[3]。项目附带若干预置“技能”（.agents/skills）和“文档”，提供数据库、云服务、代码规范等参考资料。
  上下文规则：

1. 参考优先：AI 助理回答或生成代码时，应优先查阅AI_CONTEXT.md列出的技能和文档内容[3]。凡项目已有约定的，实现需遵循约定；无现成答案时，再综合通用知识给出方案。
2. 持续记忆：AI 助理在对话中应保持对项目上下文的记忆，包括此前生成的代码、出现的错误信息和开发者的偏好。避免重复先前解释过的内容，后续回答基于当前项目状态。
3. 小步提交：AI 助理编码时遵循“小步提交”思想，每次只实现或修改一个独立功能，便于测试和回滚。实现前先简要说明方案，再给出代码。
4. 保持风格一致：AI 助理应遵守项目的代码风格和命名规范（详见“代码成长规范”文档），例如前端代码使用 TypeScript+React 风格，后端代码遵循 Spring Boot + MyBatis 分层规范。输出文档遵循 Markdown 书写规范，表述专业简洁。
5. 错误处理：当代码运行出现错误时，AI 助理首先分析错误日志，推测原因，必要时建议增加调试日志或单元测试来定位问题，而非直接给出未经验证的修复方案。
6. 安全与隐私：严禁 AI 输出包含敏感信息或违反法律法规的内容。在团队协作中，AI 不应泄露任何私有凭证、密钥等配置。
   (AI_CONTEXT.md 建议固定在 VS Code 侧边，以确保 AI 始终遵循上述项目原则。)
7. 架构设计：微服务划分与接口设计
   微服务划分与模块架构
   本项目采用 前后端解耦 + BFF（Backend For Frontend） 的分层架构，划分为三个主要服务模块：
   React 编辑端 (apps/low_code)：提供问卷的可视化编辑和管理界面，前端单页应用（SPA）[4]。主要功能包括问卷问题的增删改、组件拖拽配置、问卷列表管理等，由开发者使用浏览器访问。
   Next.js 消费端/BFF (apps/low_code_c)：问卷发布与答题页面，以及 BFF 层[4]。Next.js 负责服务端渲染(SSR)提升首屏性能，同时作为 BFF在前端与后端之间转发请求、统一数据结构，解决跨域和接口聚合问题[5][6]。用户答题时通过该模块获取问卷数据并提交答案。
   后端服务 (apps/api 计划引入)：采用 Spring Boot 实现的 RESTful API 服务，是实际的业务后端。它持久化存储问卷、问题和答案数据，提供用户认证和权限控制等功能。后端服务通过 MySQL 数据库存储业务数据，通过 Redis 提升性能。（当前开发期以 apps/mock 模块模拟后端功能，提供稳定的假数据接口，后续将由真实后端替代[7]。）
   上述各模块通过清晰的接口进行通信：浏览器只调用 Next BFF 暴露的前端路由或 API，BFF 再向后端服务请求数据。[8]这种分层解耦方便分别优化前端体验和后端性能，也便于团队并行开发。
   服务职责边界
   编辑端 (React)：负责问卷的创建和配置。包括登录注册、问卷列表、问卷设计器等前端页面逻辑。所有与问卷的设计/管理相关的操作（如新增问题、设计问卷布局、标记收藏/删除等）都在编辑端完成，并通过 API 调用后端服务来保存结果[9]。编辑端自身不直接持久化数据。
   消费端/BFF (Next.js)：负责问卷的展示与提交。消费端渲染问卷填答页面，收集用户填写的答案[10]。同时作为BFF层，承担以下职责：
   请求转发：将前端的请求转发给后端服务或Mock服务，并在必要时聚合多个后端接口的数据[11]。
   跨域处理：统一设置跨域响应头，解决浏览器直接请求后端可能遇到的跨域问题[12]。
   数据格式化：将后端返回的数据转换为前端统一的数据结构（例如封装为{ errno, data, msg }形式），确保前端渲染逻辑简单可靠。
   SSR 渲染：利用 Next.js 的getServerSideProps在服务端预取数据并渲染页面，提升首屏加载性能[13][14]。BFF 会记录每次数据获取的延迟并附加性能指标，便于监控优化[15][16]。
   后端服务 (Spring Boot)：负责业务逻辑和数据持久化。包括：用户管理（注册登录、权限）、问卷及问题保存、答案保存和统计计算等。后端按照分层架构实现：控制器 (Controller) 接收请求，服务层 (Service) 处理业务规则，数据访问层 (Mapper/Repository) 负责读写数据库。后端同时负责统一错误码和日志输出，提供可观测性支持。(开发环境下，后端职责暂由Mock服务模拟：Mock以Koa实现，快速返回假数据用于前后端联调。)[7]
   通过上述划分，各模块边界清晰：编辑端与消费端分别侧重“写”和“读”的场景，BFF 保证前端只需对接一个稳定层，后端专注业务实现和性能。即使团队不同成员分别负责前端和后端，也能通过明确的接口契约并行工作而不互相阻塞。
   核心接口设计 (API 契约)
   后端服务提供一套 RESTful API，定义了前后端交互的契约。主要接口如下（<id>等为变量）：
   用户服务 (User Service)：用户注册、登录及信息获取等
   POST /api/user/register – 用户注册：接收用户名、密码等信息，创建新用户账户[17]。返回errno状态码和新用户基本信息。
   POST /api/user/login – 用户登录：验证用户名和密码，成功则返回JWT令牌[18]。前端会将令牌存储用于后续请求认证（通过HTTP Header携带）。
   GET /api/user/info – 获取用户信息：根据当前登录用户令牌获取其个人信息（用户名、昵称等）[19]。用于在前端显示用户昵称、判断权限等。
   问卷服务 (Questionnaire Service)：问卷创建、查询、编辑等
   POST /api/question – 创建问卷：新建一个空问卷，后端生成问卷ID[20]并初始化默认属性。返回新问卷ID以便前端跳转到编辑界面。
   GET /api/question – 查询问卷列表：支持分页和过滤参数，返回当前用户创建的问卷列表。[21]可选查询参数：keyword按标题搜索，isStar=true筛选星标问卷，isDeleted=true筛选已删除问卷等。返回结果包含问卷简要信息列表和总数[22]。
   GET /api/question/:id – 获取问卷详情：返回指定ID问卷的完整信息，包括标题、描述、题目组件列表等[23][24]。未发布或已删除的问卷在前端会特殊处理提示，不允许答题。
   PATCH /api/question/:id – 更新问卷：用于修改问卷的属性（标题、描述）或标记发布状态、星标、删除等[25]。请求体包含需要更新的字段，成功返回errno=0表示更新成功。
   POST /api/question/duplicate/:id – 复制问卷：基于指定问卷ID复制一份新问卷[26]。返回新问卷的ID，前端可跳转到新问卷编辑页。
   DELETE /api/question – 批量删除问卷：支持批量永久删除问卷（例如将回收站中的问卷彻底删除）[27]。删除后不可恢复。
   答题与统计服务 (Answer/Stat Service)：收集答案和提供统计数据
   GET /api/stat/:questionId – 获取问卷统计：返回指定问卷的汇总统计数据，如总答卷数total以及各题目的汇总列表[28]。用于问卷作者查看结果概览。
   GET /api/stat/:questionId/:componentId – 获取具体题目统计：返回某问卷中某个问题选项的统计计数[29]（例如单选题各选项被选择次数）。供前端绘制统计图表。
   POST /api/answer – 提交答卷：用于问卷填写者提交答案[30]。前端将在答题页面收集用户对每个问题的回答，组装成请求提交。后端收到后将答案持久化存储，并返回errno=0表示成功。
   上述接口均采用统一的响应格式：{ errno: 0, data: {...}, msg: "" }。其中 errno=0 表示操作成功，非0则表示错误，msg包含错误信息[31]。通过统一的错误码和数据格式，前端可以用一致的逻辑处理接口响应，提升可靠性。
   接口安全：登录后，前端会在每次请求时通过请求头Authorization: Bearer <token>附带JWT令牌[32]，后端需验证该令牌有效。对于问卷的查询和提交接口，在开发阶段暂不校验权限，在生产环境将基于用户角色进行权限控制（如只有问卷创建者可以获取/修改自己的问卷）。
   端口规划
   各服务在开发环境中使用以下默认端口（可在配置或环境变量中调整）：
   服务模块 默认端口 本地URL 用途说明
   React 编辑端 3002 http://localhost:3002 问卷编辑前端SPA（开发模式）
   Next.js 消费端/BFF 3000 http://localhost:3000 问卷展示 + BFF服务
   Mock API 服务 (Koa) 3001 http://localhost:3001 模拟后端API（开发测试用）
   Spring Boot 后端服务 8080 http://localhost:8080 实际后端API服务（部署用）
   MySQL 数据库 3306 mysql://localhost:3306 数据库服务端口
   Redis 缓存 6379 （本地Redis无HTTP接口） 缓存服务端口
   说明： 本地开发时，默认使用 Mock 服务 (3001) 提供后端接口；当引入真实后端时，可将前端的API_BASE_URL指向http://localhost:8080或通过BFF转发至8080端口。React开发服务器默认端口为3000，但因Next也占用3000，这里将编辑端调整到3002端口运行，以避免冲突。生产环境中，Next应用通常会构建为静态文件，由Node或更复杂架构托管，实际端口视部署而定。
   Redis 应用场景
   项目引入 Redis 内存数据库，主要用于提高后端性能和系统健壮性：
   缓存问卷数据：将热点问卷的详情和统计结果缓存在Redis中。由于问卷发布后可能有大量用户访问答题页面，通过BFF每次都从数据库拉取问卷内容将增加延迟。引入缓存后，对于短时间内频繁访问的问卷，直接从Redis获取问卷结构和题目列表，可大幅降低数据库压力，提高响应速度。
   缓存常量数据：如问卷模板、选项列表等相对静态的数据，可预加载进Redis并长期保存，前端请求时由后端直接返回，减少计算和查询开销。
   Session/令牌存储：尽管本项目采用JWT无状态认证，但如果需要实现用户强制下线或Token失效机制，可在Redis中存储已注销或拉黑的Token列表，后端验证JWT时额外检查Redis来拒绝非法Token。
   限流与计数：Redis 原子自增操作适合做接口调用次数计数。例如针对提交答卷接口，可以用Redis的计数器记录每个问卷的提交次数，实现简单的限流或统计。对于问卷统计数据（如各选项被选择次数），也可在写入数据库的同时增量更新Redis中的计数，读取统计时直接返回Redis累积值。
   异步任务队列：将可能耗时的任务（如发送通知邮件、复杂统计计算）以消息形式写入Redis队列，再由后台工作线程异步处理，防止阻塞主请求。(当前版本未实现此功能，可作为优化方向。)
   为防止缓存不一致，后端对数据库的更新操作会同步更新或清除相关Redis缓存；同时设置合理的过期时间避免缓存脏读。对于缓存穿透、缓存击穿、缓存雪崩等情况，设计了对应策略（详见“面试讲解提示词”部分的相关问答）。总之，合理使用Redis能够换取更快的读写性能和更高的系统吞吐，但也增加了一定的复杂度，需要在代码中严格维护缓存与数据库的一致性。
8. 数据库设计：MySQL 表结构
   后端数据存储使用 MySQL 8 关系型数据库。根据业务需求，设计以下主要数据表。每张表的字段均提供注释说明，编码采用UTF8MB4以支持多语言字符。SQL建表语句如下。
   用户表 (user)
   存储平台用户账号信息。记录用户的登录凭证和基本属性。一个用户可以创建多份问卷。
   CREATE TABLE `user` (
   `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
   `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名（登录名）',
   `password` VARCHAR(100) NOT NULL COMMENT '密码Hash值',
   `nickname` VARCHAR(100) DEFAULT '' COMMENT '昵称显示名',
   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '资料更新时间'
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表：保存平台用户账号';
   用户表以自增 id 作为主键，每个用户用户名唯一。password存储加密后的密码（如BCrypt哈希），不保存明文。
   如未来需要扩展权限系统，可在此表增加角色字段或建立用户角色关联表。
   问卷表 (questionnaire)
   存储问卷（问卷表单）的主信息。每份问卷由一位用户创建，可包含多个题目组件。
   CREATE TABLE `questionnaire` (
   `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '问卷ID',
   `title` VARCHAR(200) NOT NULL COMMENT '问卷标题',
   `description` TEXT COMMENT '问卷描述',
   `creator_id` BIGINT NOT NULL COMMENT '创建者用户ID',
   `is_published` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已发布',
   `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已删除（回收站）',
   `is_starred` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否标记为星标',
   `answer_count` INT NOT NULL DEFAULT 0 COMMENT '已收集答卷数量',
   `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问卷表：保存问卷的基本信息';
   creator_id 是外键关联到用户表，表示问卷的所有者（创建人）。可以加索引 (INDEX idx_creator (creator_id)) 以便按用户查询问卷列表。
   is_published 表示问卷是否发布（发布后可被答题端访问）；is_deleted 表示是否被放入回收站（软删除）；is_starred 表示用户是否标记此问卷为星标收藏。
   answer_count 实时记录已收到的答卷提交数量，用于在问卷列表快速显示回答数（也可通过统计答案表计算，这里冗余存储优化查询）。
   关于问卷内容（题目组件），本表不直接存储具体题目信息，仅保存问卷基本元数据。题目列表存于关联的组件表或以 JSON 形式嵌入（本设计采用组件表，见下）。
   问卷题目组件表 (question_component)
   存储问卷下各题目组件的配置。每条记录代表问卷中的一个问题或表单元素。
   CREATE TABLE `question_component` (
   `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '组件ID',
   `questionnaire_id` BIGINT NOT NULL COMMENT '所属问卷ID',
   `type` VARCHAR(50) NOT NULL COMMENT '组件类型',
   `content` JSON NOT NULL COMMENT '组件内容配置（JSON）',
   `order_index` INT NOT NULL DEFAULT 0 COMMENT '组件顺序索引',
   `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
   `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
   KEY `idx_questionnaire` (`questionnaire_id`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='问卷组件表：保存问卷的各题目配置';
   questionnaire_id 外键关联问卷表，表示该组件属于哪一个问卷。在应用层，一个问卷删除时，其组件应一并删除（或通过数据库级联删除实现）。
   type 表示组件类型，例如文本题(input)、单选题(radio)、多选题(checkbox)、下拉框(select)等，用于前端渲染不同的组件。
   content 存储组件的具体配置，以JSON格式保存灵活的字段，如题目文本、选项列表、是否必填等属性。例如，对于单选题，JSON中可能包含选项数组、正确答案标记等。使用JSON类型便于存储可变结构的数据，查询某些字段时可用MySQL JSON函数。
   order_index 指定组件在问卷中的排列顺序，值越小越靠前。前端编辑时调整题目顺序会更新此索引。
   通过将问卷题目拆分为独立记录，可以方便地增删改某一道题目，并允许在数据库层面对题目进行过滤查询（如按类型统计）。若不需要单独查询题目，也可考虑将整个问卷的组件列表作为JSON存储在问卷表中，但独立表更加规范和便于扩展。
   答卷表 (answer)
   存储用户提交的问卷答卷。每条记录代表某个问卷的一次提交结果。
   CREATE TABLE `answer` (
   `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '答卷ID',
   `questionnaire_id` BIGINT NOT NULL COMMENT '问卷ID',
   `content` JSON NOT NULL COMMENT '整份答卷内容（JSON）',
   `submit_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
   KEY `idx_questionnaire` (`questionnaire_id`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='答卷表：保存用户提交的问卷答案';
   当问卷发布后，任何用户都可以填写。每次填写提交形成一条答卷记录。questionnaire_id 标识是哪份问卷。
   content 字段保存用户填写的所有答案，使用JSON结构。例如：{ "Q1": "回答1", "Q2": ["选项A", "选项B"], "Q3": "..."}，键可以是题目ID或题目顺序，值是用户针对该题的回答（字符串或数组等）。这样存储可以完整保留用户填写的数据。
   提交答卷时后端会将答案解析后存入JSON，同时可以增加校验（如必填题未答的处理）。在保存数据库的同时，后端会将问卷表的answer_count加1。
   查询统计时，可以汇总 answer 表数据。由于JSON查询在MySQL中相对开销大，为提升性能，可以在答案提交时同步更新Redis中的统计缓存，如每个选项被选择次数。这在数据分析需求较高时非常有用。
   (根据需求，还可以设计 答案详情表 将每道题的答案拆成单独记录，但在问卷题目灵活变化的场景下，采用 JSON 存储整个答卷结构更简单。)
   此外，可能的辅助表：例如保存用户登录令牌的user_token表、保存问卷邀请或分享链接的questionnaire_share表等，可根据后续需求添加。
   所有表应建立必要的索引来优化查询性能，例如常用查询按creator_id过滤问卷列表、按questionnaire_id筛选组件和答案等。在MyBatis或其他ORM框架中，应编写对应的实体类与映射配置，使数据库表结构与后端对象模型一一对应。
9. 开发部署说明（Windows 本地环境）
   本节提供在 Windows 平台搭建开发环境并运行本项目的指南，包括所需依赖安装和项目启动步骤。假定使用 Windows 10/11 系统，并已安装 VS Code 作为主要编辑器。
   前置依赖安装
   1.Node.js 与 npm： 请安装 Node.js (版本 >= 18) 和 npm (版本 >= 9)[33]。建议从 Node.js 官方网站 下载 LTS 版本并安装，这将同时安装 npm。安装完成后，打开 PowerShell，运行 node -v 和 npm -v 确认版本号。
   2.Java JDK： 如需运行后端 Spring Boot 服务，请安装 JDK 17 或以上版本（建议 AdoptOpenJDK/OpenJDK 17）。安装后，在 PowerShell 输入 java -version 验证。如果未预装构建工具，可以同时安装 Maven 或使用项目自带的 Maven Wrapper/Gradle Wrapper（若提供）。 (当前仓库没有后端模块，Java 可选)[34]。
   3.MySQL 数据库： 安装 MySQL Community Server 8.x。可通过 MySQL Installer 进行安装，选择默认的开发者配置。在安装过程中记下 root用户密码。安装完成后，确保 MySQL 服务已启动（Windows 服务名称一般为 "MySQL80"）。使用 MySQL Workbench 或命令行登录 (mysql -u root -p) 验证可以连接。然后创建项目数据库：例如执行 CREATE DATABASE lowcode CHARACTER SET utf8mb4; 创建名为 lowcode 的数据库库。
   4.Redis： Windows 平台可使用Redis提供的Windows兼容版本（如 Memurai 或 Mattitjah 的 Redis Windows 端口）或通过 Docker/WSL2 运行官方 Redis 镜像。简单起见，推荐使用 Docker：安装 Docker Desktop，启动后运行 docker run -d -p 6379:6379 --name redis redis:7.0 启动一个 Redis 容器监听本机6379端口。运行后在PowerShell中执行 docker ps 确认Redis容器在运行。
   5.Git： 安装 Git (>=2.40) 并确保在 PowerShell 可以使用 git 命令。这用于从仓库获取代码以及后续版本控制操作[34]。
   6.PowerShell 执行策略： 本项目提供了一些 PowerShell 脚本用于一键启动服务等。为确保这些脚本能运行，建议以管理员权限启动 PowerShell 并运行命令：Set-ExecutionPolicy RemoteSigned -Scope CurrentUser 以允许执行本地脚本。如不方便修改策略，每次运行脚本时可以采用 Bypass 方式（见下文）。
   项目代码获取与目录结构
   使用 Git 将仓库代码克隆到本地：

git clone https://github.com/Rin23432/low_code_fullStack.git
进入项目根目录，可以看到以下主要子目录：
apps/low_code：React 前端编辑端源码
apps/low_code_c：Next.js 前端消费端/BFF源码
apps/mock：模拟后端的 Koa 服务源码
docs：工程文档
scripts：常用脚本（如开发启动脚本等）
克隆后，首先安装各模块依赖：

# 切换到仓库根目录后执行：

npm --prefix apps/mock install # 安装 Mock 服务依赖
npm --prefix apps/low_code install # 安装 React 编辑端依赖
npm --prefix apps/low_code_c install # 安装 Next.js BFF 端依赖
以上命令使用 npm 的 --prefix 参数在各子项目目录下执行安装[35]。网络不佳时可多重试几次或更换 npm 源。依赖安装完成后，目录下会出现各自的 node_modules 文件夹。
(如果后端模块 apps/api 已添加，则还需根据后端所用构建工具安装依赖：如Maven项目则运行 mvn install 下载依赖。当前无该模块，无需此步。)
本地运行步骤
开发环境下，需要同时启动 Mock服务、编辑端前端、消费端/BFF 三个服务。建议在 VS Code 中使用集成终端或开启三个独立 PowerShell 窗口，按以下顺序启动：1.启动 Mock API 服务：
在项目根目录执行：

npm --prefix apps/mock run dev
该命令会运行 Koa 应用，监听端口 3001[36]并输出日志“MOCK服务启动在端口 3001”。Mock 服务启动后将持续运行，提供假数据接口，例如 http://localhost:3001/api/question 等。2.启动 Next.js 消费端/BFF：
在项目根目录执行：

npm --prefix apps/low_code_c run dev
首次运行会构建 Next.js 项目并启动开发服务器，默认监听端口 3000[37]。控制台日志中若提示端口被占用，会自动选取下一个可用端口（通常是3002）。假设成功启动，终端将显示类似 “ready - started server on 0.0.0.0:3000, url: http://localhost:3000”。3.启动 React 编辑端：
在项目根目录执行：

npm --prefix apps/low_code start
该命令将运行 React 开发服务器 (使用 Create React App 的 craco)，默认尝试监听3000端口[38]。由于3000端口可能已被Next占用，React脚手架会提示是否使用其他端口，输入 Y 确认即可使用 3002 端口运行。成功启动后，终端会显示 “Starting the development server...” 以及在浏览器访问的地址。
(可选) 启动 Spring Boot 后端： 若已开发真实后端服务（替代 Mock），可以通过 IDE 或命令行启动。例如使用 Maven 构建：运行 mvn spring-boot:run，或执行打包后的Jar：java -jar lowcode-api.jar。确保后端服务连接到了本地 MySQL 数据库（可在 application.properties 中配置 URL、用户名和密码），并监控启动日志确认成功连接数据库和Redis。如果使用真实后端，可能需要在Next BFF中调整转发目标为该服务的端口（例如修改 .env 或源码中的 API 地址）。
本地验证与调试
按照上述顺序启动后，进行以下最小验证以确保各部分协同正常：1.访问前端页面： 打开浏览器，访问编辑端地址 http://localhost:3002（若React使用了3002端口）或Next端地址 http://localhost:3000 查看页面是否正常加载[39]。正常情况下：2.访问 http://localhost:3000 会看到问卷答题端的首页或问卷列表页面（具体取决于实现），如果没有已发布问卷可能页面内容为空。3.访问 http://localhost:3002 (编辑端) 应显示登录/注册或问卷管理界面。首次使用需要注册一个新账户，然后登录进入“我的问卷”列表。4.接口联调： 在编辑端界面中新建一个问卷或刷新问卷列表，触发前端请求后端接口。比如登录后进入“我的问卷”页面，前端会调用 GET /api/question 接口获取问卷列表数据[40]。此时应观察：5.浏览器Network面板显示请求 http://localhost:3001/api/question?... 返回状态200，响应体包含 errno: 0 且有问卷列表数据。6.后台 Mock 服务终端应打印出对应请求的日志（如“GET /api/question”）。[41]
如果使用Next BFF，前端请求可能表现为对 /api/bff/question 路径的调用，再由BFF转发至Mock服务，检查Next终端和Mock终端均应有日志输出。7.数据提交： 在答题端 (Next 页面) 打开一个问卷进行填写（可以通过编辑端将某问卷设置为发布状态，然后在 http://localhost:3000/question/[id] 打开它）。填写后提交，前端应调用 POST /api/answer 接口提交数据，Mock 服务返回 errno:0 表示成功[30]。提交后可在 Mock 终端看到对应日志，没有严重错误则表示前后端联调成功。8.数据库确认： 如果已连接真实数据库且使用真实后端，此时可连接 MySQL 检查是否有数据写入。例如查看 user 表确认注册用户存在，questionnaire 表有新建的问卷记录，answer 表有提交的答卷记录等。使用 SELECT 语句查询相应表，确保数据格式正确无误。
若以上步骤都正常，则开发环境搭建成功。可以开始在本地进行功能开发和调试。
常见问题排查
端口占用异常： 如果终端提示端口已被占用导致服务无法启动，使用命令 netstat -ano | findstr :3000（将3000替换为具体端口）查找占用该端口的进程PID，然后执行 taskkill /PID <PID> /F 强制结束冲突进程[42]。随后重新启动对应服务。
npm依赖安装失败： 若执行npm install过慢或出错，可以尝试切换网络环境或使用国内镜像源（如执行 npm config set registry https://registry.npmmirror.com 临时使用淘宝源）。安装前可以先清空缓存：npm cache clean --force[43]。还可逐个模块安装以定位问题模块。
PowerShell 脚本无法运行： 若执行 scripts/dev.ps1 脚本时报“未经数字签名的脚本无法运行”，请确保已按照前述修改执行策略。如果不方便永久修改，可在运行时使用powershell -ExecutionPolicy Bypass -File scripts/dev.ps1 绕过策略限制[44]。
前端页面空白： 确认所有服务均已启动且无报错。如果Next应用500错误，可能Mock服务未启动或接口报错。可直接在浏览器访问 http://localhost:3001/api/question 测试Mock接口是否返回数据[42]。如接口正常但页面仍空白，打开浏览器控制台查看是否有JS错误或网络请求404。针对404，检查 Next 项目是否正确运行在所需端口[45]。
数据库连接失败（真实后端）： 如果后端启动日志出现数据库连接错误，检查 application.properties 数据库配置是否正确，以及MySQL服务是否在本机运行、用户名密码是否匹配。有需要可在 MySQL 中为项目单独创建用户并授权给新数据库。
通过上述指南，开发者应能够在 Windows 本地顺利启动并运行整个系统。在后续开发中，可以根据需要编写更多脚本或调整配置以优化本地开发体验。
(更多深入的环境问题和解决方案请参考 docs/05-dev-setup-windows.md 中的疑难解答部分。) 5. 代码成长规范
为保证代码质量和团队协作效率，需要遵循统一的编码规范和开发流程。以下是本项目约定的代码成长指南：
命名规范： 采用 清晰、一致 的命名风格。前端代码使用驼峰式命名（camelCase）命名变量和函数，组件和类名使用帕斯卡命名（PascalCase），例如 QuestionCard、useLoadData。[46]后端 Java 代码遵循驼峰命名和Oracle Java命名惯例，类名使用 PascalCase（如 QuestionService），方法名和变量用 camelCase（如 getQuestionList）。数据库表和字段命名采用全小写下划线风格（snake_case），例如表questionnaire，字段created_at，以便与SQL风格保持一致。命名应当语义明确，避免缩写；如果缩写必须使用，应全部大写（例如 HTMLParser 中 HTML）。
项目模块划分： 按照职责分层和功能领域划分代码模块。前端项目按页面/组件/状态分层：pages/ 下按照页面组织代码，components/ 存放可重用UI组件，hooks/ 存放自定义钩子逻辑，store/ 管理 Redux 全局状态等。后端项目按业务领域和MVC分层：控制器 (controller 包) 只处理HTTP请求和响应格式；服务 (service 包) 封装业务逻辑；数据访问 (mapper/repository 包) 仅负责与数据库交互。不同领域（用户、问卷等）的代码在各自子包内，避免交叉。通过清晰的模块边界，新功能应当被添加到恰当的模块中，防止出现“上帝类”或凌乱依赖。
编码风格与格式： 全体代码遵循 一致的代码风格。前端遵循常用的 ESLint + Prettier 规则，已在项目中配置好格式化工具[47]（提交前可运行 npm run format）。后端遵循Java代码格式（4空格缩进、每行不超过120字符等），推荐使用 IDE 的格式化功能。提交前确保无Lint错误和TypeScript类型错误。命名使用英文，注释力求简洁专业。
调试和日志： 建立有效的调试习惯。代码中充分添加日志，对于关键流程（如用户登录、提交答案）在后端使用日志记录输入输出及操作结果。日志级别区分 CLEAR：一般信息用 INFO，重要事件和异常捕获用 WARN/ERROR，调试细节用 DEBUG 并默认关闭[48]。前端使用浏览器开发者工具调试，必要时使用 console.log 打印重要变量（提交代码前应去除调试日志）。善用断点调试：在 VS Code 中调试React/Next前端，或使用 IDE 附加调试后端的Java进程。错误处理规范：前后端都应捕获异常并提供友好的错误提示：后端抛出的业务异常转换为错误码和信息，前端根据 errno 显示用户可理解的消息，同时在控制台输出技术细节供开发定位。
版本控制与提交： 使用 Git 进行版本控制，遵循 合理的小步提交 原则，每次提交只解决一个问题或实现一个小功能。启用 commitlint 等工具强制规范 Commit message 格式[49][50]，推荐使用 “类型(scope): 简要描述”的形式，如 feat(editor): 增加问卷复制功能 或 fix(api): 修复题目列表翻页bug。通过语义化的提交记录，方便日后追踪历史。每次提交前运行测试（若有）和Linter，确保CI通过。使用 Pull Request 工作流程进行代码审查，至少一名成员Review通过后再合并主分支。
测试与CI/CD： 后续会逐步补充自动测试。前端使用 Jest/Testing Library 编写单元测试和组件测试；后端使用 JUnit 或 Mockito 进行业务逻辑测试。关键路径（例如问卷保存和提交）将配备端到端测试确保集成可靠性。持续集成 (CI) 流水线将配置在GitHub Actions或其他平台，每次推送自动执行构建、测试和代码风格检查，防止不符合规范的代码进入主干。持续交付 (CD) 暂未启用，之后会考虑容器化部署，使用Docker将各服务封装，并通过简单脚本一键部署到测试/生产环境。
遵循以上规范能够保证代码随着功能增长依然 可读、可维护、可扩展。团队每位成员在开发中都应自觉遵守，并相互Code Review以保持风格一致。当有新的最佳实践产生时，及时更新此规范文档，持续改进团队的开发效率和代码质量。6. 前端提示词模板（React + Codex）
在使用 VS Code + Codex 开发前端功能时，可以通过精炼的中文提示词，引导 AI 快速产出符合项目需求的代码。以下是一些前端场景下的提示词模板，开发者可直接复制使用或根据需要调整：
场景1：组件挂载时调用 API 并管理加载状态
提示词： 请在 React 组件中实现以下功能：组件加载时（useEffect），调用 GET /api/question 接口获取问卷列表数据。数据请求过程中显示加载状态（转圈动画），数据返回后将结果保存在组件状态中进行渲染。如请求失败，捕获错误并显示错误消息。使用已有的 getQuestionListService 异步函数，无需重复实现请求逻辑。
场景2：全局状态管理（使用 Redux）
提示词： 请编写 Redux 相关代码来管理用户登录状态。包括：创建 userSlice，state 包含 username 和 token 字段；实现 login 和 logout action。login action 在传入用户名和token时更新状态，logout 清空状态。使用 @reduxjs/toolkit 简化样板代码，并提供 TypeScript 类型定义。之后演示如何在组件中使用该 slice（通过 useSelector 获取用户名，在 useDispatch 派发 logout）。
场景3：事件处理与表单
提示词： 在 React 中创建一个问卷标题编辑表单。要求：包括一个文本输入框和“保存”按钮。输入框绑定组件本地状态title，支持 onChange 实时更新。点击“保存”按钮时，触发一个函数，将当前 title 通过 Axios POST 请求提交到 /api/question/<id> 接口更新问卷标题。请编写对应的组件代码，包含表单 JSX 和事件处理函数。注意：接口调用前需简单校验标题非空，接口调用使用已有 axios 实例，并根据返回的 errno 判断是否更新成功。
上述提示词示例涵盖了数据获取、全局状态和事件处理等场景。使用这些模板，可以让 Codex 生成初步代码，然后由开发者根据项目实际情况调整。例如，模板1将帮助生成带有loading状态的列表获取逻辑，模板2快速创建Redux模块，模板3提供表单交互代码。在提示词中清晰描述需求、指定函数或接口名称，可以提高 AI 输出与项目代码的契合度。
开发者也可以逐步细化需求，如先让 AI 给出实现思路步骤，确认后再让其编写具体代码。通过这种交互，可以高效完成前端开发任务，同时保证代码与现有框架集成良好。
(提示：前端提示词最好在Codex对话中新开一条，避免上下文干扰。如果AI偏离主题，可以在提示中强调“只需给出…相关的代码，不要包含其他解释”。) 7. 后端提示词模板（Spring Boot + Codex）
在开发后端 Spring Boot 模块时，Codex 可以帮助生成样板代码和重复性的逻辑。以下是几个典型后端开发场景的提示词模板：
场景1：生成 Controller 类
提示词： 使用 Spring Boot 开发 REST 控制器，实现问卷管理接口。请创建一个 QuestionController 类，包含以下接口方法：

- @GetMapping("/api/question")：调用服务层获取当前用户的问卷列表（支持keyword查询参数过滤）。
- @PostMapping("/api/question")：调用服务创建新问卷，并返回新问卷ID。
- @GetMapping("/api/question/{id}")：调用服务获取指定ID的问卷详情。
- @PostMapping("/api/question/duplicate/{id}")：调用服务复制问卷。
  每个接口返回统一响应对象 CommonResp（含errno, data, msg字段）。请编写控制器类和方法签名，并添加必要的注解和简单的日志输出。
  场景2：生成 Service 层代码
  提示词： 请实现 QuestionService 类，提供问卷相关业务逻辑方法，例如：
- List<QuestionDTO> getQuestionList(Long userId, String keyword) 获取某用户的问卷列表，可按标题关键词过滤。
- QuestionDTO getQuestionById(Long userId, Long id) 获取问卷详情（需校验是否属于该用户）。
- Long createQuestion(Long userId, QuestionDTO data) 创建新问卷并返回ID。
- Long duplicateQuestion(Long userId, Long id) 复制问卷。
  为简化处理，可假设 DTO 已存在且与实体结构类似。方法内部调用 Mapper 层完成数据库操作（例如 questionMapper.selectByUserId 等），并处理业务规则（如未找到问卷抛出异常）。请给出 QuestionService 类的代码，包含上述方法的基本实现（使用伪代码或简单逻辑即可）。
  场景3：生成 MyBatis 实体和映射
  提示词： 请创建 MyBatis 所需的实体类和映射接口用于问卷功能：
- 实体类 QuestionDO 对应数据库中的问卷表（字段有 id, title, description, creatorId, isPublished, isDeleted, isStarred, answerCount 等），使用 Lombok 注解简化代码。
- Mapper 接口 QuestionMapper 包含基本的 CRUD 方法：insertQuestion(QuestionDO question)、selectById(Long id)、selectListByUser(Long userId)、updateQuestion(QuestionDO question)、deleteQuestions(List<Long> ids) 等。
  同时提供对应的 MyBatis XML 配置或注解配置。确保 Mapper 方法与实体类字段映射正确。例如 selectListByUser 根据 creator_id 字段筛选未删除问卷列表，并按创建时间倒序。请分别给出实体类和 Mapper 接口（含方法定义）的代码。
  使用上述模板可以让 AI 快速产出后端各层的基本代码结构。例如，模板1会生成带有Spring MVC注解的控制器，模板3会生成与数据库表对应的实体和DAO接口代码。注意：由于Codex对上下文理解有限，建议一次请求生成单一类/接口，分步骤进行。先生成实体，再生成Mapper接口，再生成Service，实现Controller。每一步都可以将上一步骤产出的代码供AI参考，以保持风格和字段一致。
  另外，可让 Codex 顺带生成单元测试样板。例如在 Service 方法生成后，提示 “请为 QuestionService.getQuestionById 方法编写一个简单的单元测试，用Mockito模拟 Mapper 的行为”。这样确保业务代码和测试用例同步。通过这种人机协作，可以较快地搭建起后端的工程骨架。

8. Debug 提示词模板（错误分析与调试）
   当项目遇到异常或Bug时，可以利用 Codex 帮助分析问题、定位原因并提供调试思路。以下是几种调试场景及相应的提示词示例：
   场景1：异常原因分析
   提示词： 我在调用后端接口时遇到错误：前端收到 HTTP 500 错误，而后端日志只看到NullPointerException，未打印详细堆栈。请分析这种NullPointerException可能的原因，并给出调试思路。需要考虑代码中哪些地方可能出现空指针，以及如何修改代码避免再次发生。
   场景2：插入调试日志
   提示词： 请帮我审查以下后端代码片段，并在关键步骤插入调试日志：

public List<QuestionDTO> getQuestionList(Long userId) {
List<QuestionDO> entities = questionMapper.selectListByUser(userId);
List<QuestionDTO> result = new ArrayList<>();
for (QuestionDO entity : entities) {
// 转换实体为DTO
result.add(convertToDTO(entity));
}
return result;
}
在进入方法时打印 userId，在得到entities结果后打印其 size，在返回前打印 result 大小。使用合适的日志级别和清晰的提示信息。
场景3：追踪错误链
提示词： 后端启动时出现 BeanCreationException，但堆栈很长不容易看出是哪处配置有问题。请根据以下异常片段协助定位问题：

BeanCreationException: Error creating bean with name 'dataSource'
Caused by: java.net.ConnectException: Connection refused (Connection refused)
这个错误可能说明什么？我该检查哪些配置或服务？请给出排查步骤，比如验证数据库连接配置，检查MySQL服务是否启动等。
场景4：前端状态异常调试
提示词： React 编辑端出现一个问题：在问卷列表页删除问卷后，UI 未及时更新，需要刷新才能看到变化。请协助分析可能原因：可能是前端状态没有正确更新或接口返回未合并。代码使用了 useRequest 钩子加载列表。应该如何修改以即时更新列表？是否需要从接口返回最新列表或者前端手动移除已删除项？请给出解决思路。
通过这些提示词，Codex 可以像一个经验丰富的助手一样给出调试建议。例如，在异常分析场景，Codex可能会列举NullPointerException的常见原因（对象未初始化、依赖注入失败等），并建议在可能出错的地方增加非空判断或日志。插入日志的场景，Codex会产出修改后的代码，带有logger.debug("...")等语句。对于复杂的错误链，Codex可以帮助提炼核心信息，指导开发者一步步验证假设（如数据库未连通导致的数据源初始化失败）。
使用 Debug 提示词时要注意：尽量提供具体的错误信息或代码片段给 Codex，这样它才能结合上下文进行分析。问题描述应明确异常现象、期望行为和已尝试的步骤。Codex 给出的分析需要由开发者验证，切勿不加思考直接修改代码。将 Codex 视为头脑风暴的伙伴，多角度考虑它提供的线索，往往能更快定位棘手问题。
(建议调试时分多轮和 AI 交互：先让它分析可能原因，然后根据建议尝试手动修改或加入日志，再将新发现反馈给AI继续深挖。) 9. 面试讲解提示词模板（架构与亮点阐述）
当需要向他人介绍项目时，可以借助 Codex 梳理并输出结构化的讲解内容。以下提供针对面试场景的提示词，帮助生成对架构、亮点和优化的精炼总结：
场景1：整体架构讲解
提示词： 假设你在技术面试中，需要用2分钟介绍本项目的架构，请以讲解者的身份组织语言。包括：项目分层（前端编辑端、前端BFF端、后端服务）、各模块的职责，以及一次典型请求从前端到后端的流程。要求语言简洁清晰、条理分明，突出架构设计的合理性。
场景2：设计亮点总结
提示词： 列出本项目中你认为有价值的设计亮点，并解释每一点为何提升了项目质量或性能。至少包括：接口契约驱动开发（前后端以清晰契约对接，提高联调效率）、BFF 层引入（在前后端之间增加缓冲，统一数据格式、简化跨域）、Mock 模块（允许前后端并行开发）。用项目实例数据或指标来说明这些亮点的效果。
场景3：性能优化策略
提示词： 面试官问你为提高系统性能做了哪些优化，请总结回答。内容包括：采用 SSR 提升首屏速度、使用 Redis 缓存热点数据减轻数据库压力（提到缓存穿透/击穿应对措施）、接口调用的异步处理或者限流措施、以及前端层面的优化（如按需加载组件、减少不必要的重渲染）。要求论点全面，但每点描述简明扼要。
使用这些提示词，Codex 可以生成接近面试回答要求的内容。例如，架构讲解会产出一段有序的描述，涵盖各模块分工和调用链路（类似于 2 分钟 Demo 讲稿的要点[51]）。设计亮点总结则让 Codex 聚焦在项目中特有的策略，给出有理有据的解释，例如“通过接口契约文档降低了前后端联调失败率约X%”[52]。性能优化部分Codex会结合通用最佳实践和本项目提到的缓存/SSR进行说明。
开发者可以根据Codex输出的回答，再结合自己的真实经验润色。由于Codex基于提供的文档和常识作答，它可能遗漏团队在项目中做的其它改进，开发者应补充。重点在于让AI梳理框架，使自己的讲解更有条理。通过多次尝试不同提示词，最后整理出一份关于项目架构与亮点的“标准答案”，在真实面试中就能应对自如。
(小贴士：可以要求 Codex 以“要点列表”形式输出答案，使内容层次清晰。例如在提示词中说明“请分条列出…”。) 10. 一键文档生成脚本（PowerShell）
为了方便将上述所有文档和模板文件快速添加到项目的 docs/ 目录下，提供一个 PowerShell 脚本实现自动创建和填充文件的功能。运行此脚本将在 docs 目录生成/更新文件：AI_CONTEXT.md、架构设计.md、数据库设计.md、开发部署.md、代码规范.md、前端提示词.md、后端提示词.md、Debug提示词.md、面试提示词.md 等。请根据需要调整文件名和路径。脚本内容如下：

# 确保当前工作目录为仓库根目录

New-Item -Path "docs" -ItemType Directory -Force | Out-Null

# 1. AI_CONTEXT.md

$aiContext = @"

# AI_CONTEXT (Pin this file in your IDE)

## 项目目标

项目旨在构建一个低代码问卷系统，包括问卷编辑、发布答题、数据统计等功能，支撑多人协作开发和扩展真实后端服务。

## AI 协作原则

- **人机分工：** 开发者负责需求和验收，AI 负责根据指令编写代码和文档。
- **先规划后编码：** 让 AI 先输出计划步骤，再逐步实现，减少错误。
- **迭代优化：** 初版实现后，由开发者测试，再引导 AI 优化性能和风格。

## 角色定义

- **开发者：** 提需求、审AI输出、集成代码，确保项目方向正确。
- **AI 助理(Codex)：** 扮演资深工程师，依据上下文提供代码和建议，遵循项目规范。
- **上下文/环境：** VS Code + CodeCap 扩展。AI_CONTEXT.md 文件会被固定，AI 助理必须优先参考其中列出的技能和文档。

## 上下文规则

1. **参考优先：** AI 必须优先查阅项目提供的技能库和文档，再给方案。
2. **持续记忆：** AI 在对话中记住先前代码和讨论，不重复已有解释。
3. **小步提交：** AI 每次只实现一个小功能，便于测试和回滚。
4. **风格一致：** 遵守项目代码和文档风格（驼峰命名、统一响应格式等）。
5. **错误处理：** 出错时优先分析日志，建议增加调试手段，而非盲目给结论。
6. **安全与隐私：** 不输出敏感信息，不泄露私有配置。
   "@
   Set-Content -Path "docs/AI_CONTEXT.md" -Value $aiContext -Encoding UTF8

# 2. 架构设计文档

$architecture = @"

# 架构设计

## 微服务架构概览

- **React 编辑端 (3002)：** 前端SPA，负责问卷创建、编辑、管理。
- **Next.js 消费端/BFF (3000)：** 前端SSR页面，负责问卷展示和答题，同时作为BFF转发请求。
- **后端服务 (8080)**：Spring Boot 实现的REST API，负责业务逻辑和数据存储。（开发期以Mock服务3001模拟）

各模块通过REST接口交互，浏览器只需调用BFF提供的统一接口。

## 模块职责

- **编辑端：** 提供问卷可视化编辑，处理用户账户登录、注册，问卷的增删改等操作，通过API调用后端保存数据。
- **消费端/BFF：** 提供问卷填答页面，并通过Next API Routes充当BFF，将前端请求转发给后端或Mock。统一数据格式，解决跨域，进行SSR提升性能。
- **后端服务：** 提供用户、问卷、答案等核心接口，进行数据校验和持久化。统一错误码和日志输出，保障安全与可观察性。

## 核心接口设计

- **用户接口：** `POST /api/user/register` 注册，`POST /api/user/login` 登录，`GET /api/user/info` 获取用户信息。采用JWT认证。
- **问卷接口：** `POST /api/question` 创建问卷，`GET /api/question` 查询问卷列表（支持筛选），`GET /api/question/{id}` 获取问卷详情，`PATCH /api/question/{id}` 更新问卷属性，`POST /api/question/duplicate/{id}` 复制问卷，`DELETE /api/question` 批量删除问卷。
- **答卷接口：** `POST /api/answer` 提交答卷，`GET /api/stat/{questionId}` 获取问卷总统计，`GET /api/stat/{questionId}/{componentId}` 获取指定题目的统计数据。

所有接口响应格式统一为 `{"errno":0,"data":...,"msg":""}`。前端通过 Axios 拦截器统一处理非零 errno 的错误[31]。

## 端口分配

| 模块                | 端口 | 说明                |
| ------------------- | ---: | ------------------- |
| React 编辑端        | 3002 | 开发服务器，HMR支持 |
| Next.js BFF         | 3000 | 开发服务器，提供SSR |
| Mock API (开发专用) | 3001 | Koa假数据服务       |
| Spring Boot API     | 8080 | 实际后端服务        |
| MySQL 数据库        | 3306 | 数据存储            |
| Redis 缓存          | 6379 | 缓存服务            |

## Redis 应用

- 缓存热点问卷详情和统计结果，减轻数据库读负载。
- 存储用户会话/Token黑名单，实现集中会话管理。
- 采用缓存穿透、击穿、雪崩防护策略保障缓存层稳定（如空结果缓存、互斥锁、过期时间随机等）。
  "@
  Set-Content -Path "docs/architecture-design.md" -Value $architecture -Encoding UTF8

# 3. 数据库设计文档

$database = @"

# 数据库设计 (MySQL)

项目使用 MySQL 8 保存业务数据，设计了用户、问卷、组件、答卷四张核心表。建表SQL如下：

```sql
CREATE TABLE user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(100) NOT NULL COMMENT '密码Hash',
  nickname VARCHAR(100) COMMENT '昵称',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);
CREATE TABLE questionnaire (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '问卷ID',
  title VARCHAR(200) NOT NULL COMMENT '标题',
  description TEXT COMMENT '描述',
  creator_id BIGINT NOT NULL COMMENT '创建者用户ID',
  is_published TINYINT(1) DEFAULT 0 COMMENT '已发布标志',
  is_deleted TINYINT(1) DEFAULT 0 COMMENT '删除标志',
  is_starred TINYINT(1) DEFAULT 0 COMMENT '星标标志',
  answer_count INT DEFAULT 0 COMMENT '答卷数量',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);
CREATE TABLE question_component (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '组件ID',
  questionnaire_id BIGINT NOT NULL COMMENT '所属问卷ID',
  type VARCHAR(50) NOT NULL COMMENT '组件类型',
  content JSON NOT NULL COMMENT '组件配置JSON',
  order_index INT DEFAULT 0 COMMENT '排列顺序',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);
CREATE TABLE answer (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '答卷ID',
  questionnaire_id BIGINT NOT NULL COMMENT '问卷ID',
  content JSON NOT NULL COMMENT '答卷内容JSON',
  submit_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间'
);
说明：
- 用户表保存平台用户账号（用户名、密码Hash等）。
- 问卷表保存问卷基本信息（标题、描述、创建者、发布/删除状态等）。
- 问卷组件表保存问卷下每个题目组件的详细配置（采用JSON存储内容，包含题目文本、选项等），并用 order_index 确定显示顺序。
- 答卷表按提交记录问卷的填写答案，content 字段存整份问卷的回答(JSON结构)。
各表通过外键关联（如 questionnaire.creator_id -> user.id，question_component.questionnaire_id -> questionnaire.id，answer.questionnaire_id -> questionnaire.id）。查询时会用索引优化常用条件（例如按 creator_id 查询用户的问卷列表）。
数据库使用 InnoDB 引擎并统一UTF8MB4字符集。通过 MyBatis 等框架，将上述表结构映射为后端实体和DAO，使应用层可以方便地存取数据库。 "@ Set-Content -Path "docs/database-design.md" -Value $database -Encoding UTF8
4. 开发部署说明文档
$devSetup = @"
开发部署说明 (Windows)
环境依赖
Node.js >= 18，npm >= 9[33]
JDK >= 17（如需运行Spring Boot后端）
MySQL 8.x（用于数据存储）
Redis 7.x（用于缓存，可选开发期用Docker启动）
PowerShell 5.1 或 7+，Git 2.40+[34]
安装步骤
1.安装 Node.js 和 npm： 从官网安装 Node.js，即可获得 npm。
2.安装 JDK： 从 OpenJDK 获取并配置环境变量。
3.安装 MySQL： 安装后启动服务，在本地创建数据库 lowcode 并设置用户。
4.安装 Redis： Windows 下可使用 Docker 启动 Redis 容器(docker run -d -p 6379:6379 redis:7.0)。
5.克隆代码仓库： git clone https://github.com/Rin23432/low_code_fullStack.git 并进入目录。
本地运行
1) 安装依赖：

npm --prefix apps/mock install
npm --prefix apps/low_code install
npm --prefix apps/low_code_c install
2) 启动服务： 建议三个终端分别执行：

npm --prefix apps/mock run dev        # 启动Mock后端 (端口3001)
npm --prefix apps/low_code_c run dev  # 启动Next消费端 (默认端口3000)
npm --prefix apps/low_code start      # 启动React编辑端 (默认端口3000或自动调整)
注意：首次启动React编辑端时，如3000端口被占用会提示使用其他端口（输入Y使用3002端口）。也可直接通过参数设置特定端口。
(如有真实后端) 启动Spring Boot后端： 使用IDE运行 Application，或在 apps/api 目录执行 mvn spring-boot:run。默认监听8080端口。
3) 验证运行：
- 打开浏览器访问 http://localhost:3000 应能看到问卷前端页面（Next渲染的页面）。
- 访问 http://localhost:3002 打开编辑端，注册并登录。
- 登录后，新建问卷并在列表中查看，应触发请求 GET http://localhost:3001/api/question 并成功返回问卷列表[39]。
- 在答题端选择一个问卷填写并提交，触发 POST http://localhost:3001/api/answer，Mock返回errno=0，表示提交成功。
常见问题
端口冲突： 使用 netstat -ano | findstr :3000 确认占用进程，使用 taskkill /PID <PID> /F 结束冲突[42]。
依赖安装失败： 清理缓存后重试，或更换npm源[43]。
脚本执行受限： 以管理员身份运行 Set-ExecutionPolicy RemoteSigned -Scope CurrentUser 解除限制，或运行脚本时使用 Bypass 参数[44]。
更多详情请参阅项目 README 和 docs/05-dev-setup-windows.md 文档。 "@ Set-Content -Path "docs/dev-setup-windows.md" -Value $devSetup -Encoding UTF8
5. 代码规范文档
$codeGuide = @"
代码成长规范
命名约定
前端： 变量和函数采用小驼峰 (camelCase)，React 组件采用帕斯卡 (PascalCase)。文件和文件夹名使用短横线或小驼峰，保持一致。避免使用拼音或模糊缩写，名称应见名知意。
后端： Java 类名用 PascalCase，如 UserController，方法和属性用 camelCase，如 getUserName()。SQL 表名、字段名用蛇形小写，如 questionnaire，多词用下划线分隔。常量采用全大写下划线，如 MAX_RETRY.
模块划分
前端结构： 按页面和功能分层。pages/ 下每个页面一个文件夹，内部组织子组件；components/ 放通用组件；hooks/ 放自定义 Hook；services/ 封装 API 请求；store/ 管理 Redux 状态。不同域的代码不混用，如用户相关逻辑在 services/user.ts 和 store/userReducer.ts 中实现。
后端结构： 按典型三层架构分包：controller (接口层)、service (业务层)、mapper (数据层)。例如用户相关功能集中在 user 子包下的 UserController, UserService, UserMapper 等类中。禁止在控制器中写业务逻辑或直接操作数据库，所有数据修改通过 Service 完成。
编码风格
使用 一致的代码格式。前端已配置 Prettier 和 ESLint，提交前运行 npm run format 和 npm run lint 确保通过。后端遵循 Sun Java 编码规范，可使用 IDE 自动格式化。
字符串使用单引号（除非模板字符串），行末不加分号 (JS/TS 根据配置自动处理)。Java中遵循标准格式，每行至多120字符。
注释：重要模块、复杂算法必须有注释。采用 JSDoc/JavaDoc 风格描述函数用途、参数和返回值。其余地方尽量写自解释代码，少用冗余注释。
调试与日志
日志： 后端使用 SLF4J 日志框架记录运行信息。重要操作（登录、提交等）INFO级别；异常ERROR级别并打印栈；调试细节DEBUG级别在开发时启用[48]。前端调试可用 console.log，但提交前移除。
错误码： 后端统一使用标准错误码和消息，前端据此显示用户友好提示。禁止将敏感错误直接返回前端。
调试： 善用断点。推荐使用 VSCode Debugger 附加Chrome调试前端，使用 IntelliJ 等调试后端。通过分层断点可快速定位问题。
提交与协作
Git 分支策略： 主分支 (main) 保持稳定，用于可部署版本。功能开发在 feature 分支进行，命名如 feature/login-page，完成后提交 PR 合并。[53]
Commit 信息： 使用英文描述变更，格式遵循 Conventional Commits，如 feat: add user login API 或 fix: resolve null pointer in QuestionService。提交前确保每个commit独立通过所有测试。
Code Review： 所有合并入主分支的变更需经过至少一名成员审核。评审关注代码逻辑是否清晰、是否有潜在bug、是否符合规范等。通过Review促进知识共享和错误预防。
测试与发布
测试： 开发新功能时务必编写或更新测试。包括前端组件测试（使用 @testing-library/react）、后端单元测试（JUnit+Mock）、集成测试等。确保 npm test 和后端 mvn test 全部通过再提交。
CI/CD： 持续集成将在GitHub Actions上运行，自动执行构建与测试，lint检查等[54]。对未通过检查的PR禁止合并。持续部署暂未开启，但预留了Dockerfile和K8s配置以备后续使用。
通过遵守以上规范，团队可以保持代码库整洁一致，降低维护成本。在项目演进过程中，定期回顾并更新规范，以适应新技术栈或新的约定，但必须全员达成共识后方可修改。本规范文件也将作为新人培训的重要材料，帮助新成员快速融入开发流程。 "@ Set-Content -Path "docs/code-guidelines.md" -Value $codeGuide -Encoding UTF8
6. 前端提示词模板文档
$frontendPrompts = @"
前端提示词模板 (React + Codex)
以下为常用的前端开发场景下，开发者可直接复制给 Codex 的中文提示词示例。
1. 数据请求与状态更新：
提示词示例：
“请帮我实现 React 组件在挂载时的数据加载： 编写一个 React 函数组件，当组件首次挂载时（componentDidMount 或 useEffect 空依赖），调用 getQuestionListService() 获取问卷列表数据。加载过程中显示一个 loading 提示（例如 Ant Design 的 Spin 组件）。数据成功获取后，将返回的 list 保存到组件状态并渲染列表项。如果获取失败，捕获错误并使用 message.error 显示错误信息。”
2. 表单处理与验证：
提示词示例：
“在 React 中创建问卷标题编辑表单： 实现一个包含输入框和保存按钮的表单组件。要求：输入框绑定 title 状态，实时更新；点击保存按钮时调用 updateQuestionTitle(questionId, title) API 提交更新请求。提交前进行非空校验，提交过程中禁用按钮并显示 loading 提示，完成后根据返回 errno 判断成功或失败，成功则提示‘保存成功’，失败则显示错误消息。”
3. 全局状态管理 (Redux)：
提示词示例：
“使用 Redux 管理用户登录状态： 请编写 Redux slice （采用 @reduxjs/toolkit）用于用户信息，包括 initialState（未登录状态），reducers：loginSuccess(state, action) 保存用户名和token，logout(state) 清空用户信息。配置对应的 actions 导出。然后演示如何在 React 组件中使用：比如在 NavBar 组件中，通过 useSelector 获取当前用户昵称并显示，如果未登录则显示登录按钮；点击退出按钮 dispatch logout 动作。”
4. 路由导航与权限控制：
提示词示例：
“实现登录鉴权的路由跳转： 利用 React Router v6 实现一个受保护路由组件 PrivateRoute。如果用户已登录（可从 Redux state 判断有无 token），则渲染指定的子组件，否则 navigate 重定向到 /login 页面，并传递 returnUrl 参数。请给出 PrivateRoute 组件的代码，以及在路由配置中使用它的示例。”
使用这些模板，Codex 将产出相应场景的代码片段。例如数据请求场景，它会生成带有 useEffect 调用服务、useState 管理 list 和 loading 状态的完整代码；表单处理则会包含表单元素、事件处理和API调用；Redux 场景会生成 slice 和使用示例；权限控制则给出路由守卫实现。
开发者可以按需选择模板，将自己的具体变量名、函数名替换进去，提高 Codex 输出的准确性。提示：可以在提示中加入当前文件/函数名称，这样Codex更容易将代码插入正确的位置。例如：“在 List.tsx 中…实现 effect 加载数据”。借助这些提示词，常见前端功能开发将更加高效。
"@ Set-Content -Path "docs/frontend-prompts.md" -Value $frontendPrompts -Encoding UTF8
7. 后端提示词模板文档
$backendPrompts = @"
后端提示词模板 (Spring Boot + Codex)
下面是若干 Spring Boot 后端开发场景下的提示词示例，开发者可用其引导 Codex 生成后端代码：
1. 控制器层 (Controller)：
提示词示例：
“创建 Spring Boot 控制器类：请编写 UserController 类，实现以下 REST 接口：
- POST /api/user/register：调用 UserService 的注册方法，成功返回 errno=0 和用户信息，失败返回错误码。
- POST /api/user/login：调用 UserService 登录，成功返回JWT Token。
- GET /api/user/info：获取当前登录用户信息（通过 @RequestHeader Authorization 提供token），调用 UserService 验证token并返回用户资料。
为每个方法添加适当的 @PostMapping/@GetMapping 注解和请求/响应类型声明 (Consumes/Produces JSON)。统一返回格式使用自定义响应类 CommonResp。**”
Codex 将据此生成包含注解的控制器类，方法内部调用 Service 并返回统一响应结构的代码。
2. 服务层 (Service)：
提示词示例：
“实现用户服务类： 请编写 UserService 类，包含 register(username, password) 和 login(username, password) 方法。
- register：检查用户名是否已存在（调用 UserMapper），如存在抛出自定义异常，否则保存新用户（密码需加密后存储）并返回用户对象。
- login：调用 UserMapper 根据用户名查找用户，校验密码（假设已加密存储），匹配则生成 JWT token 返回。若失败返回错误消息。
请给出 UserService 类代码，包括上述逻辑（可省略实际加密实现，用注释标明）。**”
Codex 将生成 UserService 类主体，内含伪代码逻辑，如查询和保存用户，以及密码匹配检查等，开发者可据此完善。
3. 数据层 (Mapper/Repository)：
提示词示例：
“创建 MyBatis Mapper 接口和 XML： 请为用户创建 MyBatis 映射：
- 实体类 UserDO 对应 user 表（字段：id, username, password, nickname, createdAt）。
- Mapper 接口 UserMapper 包含方法：insertUser(UserDO user) 返回插入行数；selectByUsername(String username) 返回 UserDO；selectById(Long id) 返回 UserDO。
同时编写 MyBatis XML 配置，映射 user 表的查询。提供 insert 和 select 语句（使用 #{} 占位），以及 resultMap 将表字段映射到 UserDO 实体。**”
Codex 将输出 UserDO 类定义、UserMapper 接口和对应XML配置。开发者检查字段映射正确性后，可直接使用。
4. 异常处理及AOP：
提示词示例：
“全局异常处理： 请实现一个 Spring @RestControllerAdvice 类 GlobalExceptionHandler，捕获常见异常并统一返回错误响应：
- 捕获自定义业务异常 (如 ServiceException)，返回 errno=具体错误码，msg为异常消息。
- 捕获 Validation校验异常，返回 errno=400，msg包含校验失败信息。
- 捕获其他 Exception，返回 errno=500，msg=“Internal Server Error”。
为每个 @ExceptionHandler 编写处理方法，返回 ResponseEntity<CommonResp>。**”
Codex 会生成带有 @RestControllerAdvice 和 @ExceptionHandler 注解的方法。这样开发者可快速建立起统一错误处理框架。
通过这些提示词，后端常用的样板代码（控制器、服务、数据访问、配置等）都可以借助 AI 快速生成，避免手写重复代码。开发者应关注 Codex 输出的正确性，尤其是SQL和注解等细节。必要时提供更多表结构或类信息给 Codex 以提高准确度。例如在提示中写“UserDO 有字段… 类型分别是…”。多利用 Codex 擅长的模板生成能力，可以把更多精力放在业务逻辑和架构优化上。
"@ Set-Content -Path "docs/backend-prompts.md" -Value $backendPrompts -Encoding UTF8
8. Debug 提示词模板文档
$debugPrompts = @"
Debug 提示词模板
当出现错误或需要优化时，可以使用以下提示词引导 AI 协助分析和调试。
1. 异常分析：
提示词示例：
“错误调试： 应用启动时报错 BeanCreationException: Error creating bean with name 'dataSource'，之后有 Caused by: java.net.ConnectException: Connection refused。请帮我分析这个错误的可能原因，并列出检查清单。怀疑是数据库连接失败导致的数据源初始化异常，应如何验证？可能需要检查 application.properties 中的数据源配置（URL、用户名、密码）以及数据库服务是否启动并监听正确端口。”
Codex 将解释 ConnectException 通常表示无法连接数据库，提醒检查配置和数据库服务状态，并给出具体检查步骤。
2. 代码审查与日志：
提示词示例：
“日志排查： 我在调用问卷列表接口时前端无响应，后端日志也无报错。请审查 QuestionController.getList 方法，看看是否可能遗漏了什么。代码片段：

@GetMapping("/api/question")
public CommonResp<List<QuestionDTO>> getList(Long userId) {
    List<QuestionDTO> list = questionService.getQuestionList(userId);
    // 没有返回 body?
}
这里控制器方法没有返回值，请指出问题并给出修改建议。同时，在该方法开始和结束处加入日志，打印 userId 和返回列表长度，以便调试。”
Codex 会指出缺少 return CommonResp.success(list) 等返回语句，并给出正确的代码。也会加上日志记录以便跟踪。
3. 前端调试：
提示词示例：
“前端状态问题： 删除问卷后，UI 列表没有更新，必须手动刷新。相关代码使用 useRequest 加载数据并有一个删除按钮调用 deleteQuestionService。请帮我检查可能的问题：猜测删除成功后没有触发列表刷新。应该如何修改？需要在删除成功的回调中刷新列表数据，或者将列表状态设置为除去删除项。请提供修改建议。”
Codex 将分析 useRequest 的用法，指出可能需要调用 refresh() 或手动更新状态，并提供示例代码。
使用这些 Debug 模板，AI 会结合经验和上下文提供原因推测和解决方案。开发者应把握问题的关键信息提供给 AI，比如错误信息、相关代码、预期行为等。Codex 的建议有时需要验证，但往往能提供新的思路。例如，它可能提示某配置遗漏或某逻辑分支未考虑，这些都是人工调试易忽视的点。
最后，调试是一个反复试验的过程。将 Codex 视为搭档，尝试它的建议，观察结果，再将新的线索反馈给它，可以加速问题的解决。在这个过程中也能不断完善我们的日志和异常处理机制，让系统变得更加健壮。
"@ Set-Content -Path "docs/debug-prompts.md" -Value $debugPrompts -Encoding UTF8
9. 面试讲解提示词文档
$interviewPrompts = @"
面试讲解提示词模板
对于技术面试或项目分享场景，可使用以下提示词，帮助 AI 输出条理清晰、重点突出的讲解：
1. 项目架构说明：
提示词示例：
“请以架构师的口吻介绍本项目： 用约1-2分钟时间，说明项目背景和整体架构。包括有哪些模块（前端编辑端、前端答题端/BFF、后端服务），它们之间如何协作，以及为什么这样划分架构（各模块的作用）。请做到层次清晰、言简意赅。”
Codex 会输出一段简洁的架构综述，例如：“本项目采用前后端分离三层架构。首先是React构建的问卷编辑前端…其次Next.js提供SSR答题端并作为BFF…最后Spring Boot实现业务后端…这样的设计保证了…[55]”。
2. 核心亮点阐述：
提示词示例：
“项目亮点分享： 列出3个本项目的技术亮点或创新之处，每个用2-3句话解释其意义。可以包括：利用 Mock 模块实现前后端解耦开发，建立统一接口契约提高联调效率，引入BFF层优化性能和简化前端逻辑，等等。尽量量化这些改进的效果，例如缩短开发时间或性能提升的指标[52]。”
Codex 将生成一个要点列表，比如：“1. 契约驱动开发： 在需求初期确定接口契约，并以此为依据并行开发前后端，减少了约~X%的返工… 2. BFF统一数据：通过BFF层将后端多接口聚合，前端调用失败率下降… 3. Mock并行开发： 提供稳定假数据，使联调等待时间降低约~X%[56]…”。这些可以直接用于面试中的回答。
3. 优化与性能：
提示词示例：
“性能优化举措： 面试官问‘系统做了哪些优化来保证性能和可靠性’，请总结回答：包含缓存(Redis)的引入及缓存策略、防止缓存击穿穿透措施、SSR对首屏性能的帮助、异步处理和限流设计(如果有)，还有日志追踪和错误码体系对维护性的提升。回答时以 bullet point 列出，每点简要说明改善了什么问题。”
Codex 可能输出类似：“- 引入Redis缓存： 针对热点数据 (如问卷详情) 缓存到Redis，减少数据库负载，同时通过空值缓存、互斥锁防止缓存击穿[57][58]。- SSR优化首屏： 答题页采用Next.js SSR，首屏渲染时间降低… - 统一错误码与日志追踪： 通过统一错误码和traceId日志，缩短故障定位时间约~Y%[48]… ”。
在使用这些模板时，可以根据需要让 Codex 输出不同形式的答案：如一段演讲稿、一组面试问答、或者干货满满的要点列表。开发者可以多角度提问，例如“如果面试官深入问缓存，你会如何回答？”来让AI补充细节。
最后，将AI生成的答案和自身理解相结合，形成有自己风格的回答。在真正面试时既体现项目的技术深度，也展示个人的思考和总结能力。
"@ Set-Content -Path "docs/interview-prompts.md" -Value $interviewPrompts -Encoding UTF8
```
