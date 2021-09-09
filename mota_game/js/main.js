 let log = console.log;
 let logdata = document.querySelector(".log")
 console.log = (value) => {
     log(value);
     logdata.children[0].innerHTML = `<p> ✦ ${value}</p>` + logdata.children[0].innerHTML
 };
 // 节点负责绘制地点和绘制资源。
 class Node {
     constructor(left, top, src) {
         this.pos_x = left;
         this.pos_y = top;
         this.src = src
     }
 }
 class Game {
     constructor(can, size = 11) {
         // 声明相关变量.只赋值传入的相关变量,其他变量等待初始化.
         this.can = can;
         this.width = 0;
         this.height = 0;
         // 尺寸比例和单格高宽
         this.size = size;
         this.radix = {
             wid: 0,
             hei: 0
         };
         // 地图(图像)\英雄\物体等节点变量
         this.floor = NaN
         this.bgArr = [];
         // 将地图数据临时备份一套，用于整体缓存。
         this.map = []
         this.data = []
         this.hero = null;
         this.gate = [];
         this.monster = [];
         // 初始化启动游戏
         this.initAll();
     };
     // 总初始化函数
     initAll() {
         // 初始化游戏数据-最初和重新开始两种情况
         this.initCalc();
         // 生成点阵图数组，渲染地图。
         this.createBackground();
         // 生成角色，渲染角色
         this.creatHero();
         // 运行游戏，插入判断。
         this.gameRun();
         // 额外展示内容
     };
     // 只要刷新游戏就要重新赋值二次值和关键状态值.
     initCalc() {
         // 获取已有值
         let can = this.can;
         let size = this.size;
         // 通过计算对二次值赋值.
         this.ctx = this.can.getContext("2d");
         this.width = can.width;
         this.height = can.height;
         this.radix.wid = this.width / size;
         this.radix.hei = this.height / size;
         // 英雄的状态量
         let temphero = {
             node: null,
             i: 0,
             j: 0,
             state: {
                 blood: 400,
                 force: 6,
                 defense: 1,
                 key: [3, 3, 2],
                 exp: 0,
                 expNeed: 10
             }
         };
         this.setHero(temphero);
         // 取出其中一幅地图
         this.setOther(1, "floor");
         //  进行深拷贝，防止重启问题。
         this.data = JSON.parse(JSON.stringify(data))
         this.map = this.data.maps[this.floor - 1];
         // 怪兽的状态量
         this.monster = data.monster
     };
     // 首屏绘制地图
     createBackground() {
         let bgArr = []
         let size = this.size
         let radix = this.radix
         let map = this.map;
         let temp = ""
         for (let i = 0; i < size; i++) {
             bgArr[i] = []
             for (let j = 0; j < size; j++) {
                 temp = map[j][i].split("_")
                 switch (temp[0]) {
                     case "Blood":
                         temp = temp[1] == "R" ? "img/p9.png" : "img/p13.png";
                         break;
                     case "Gate":
                         temp = temp[1] == "Y" ? "img/p3.png" : temp[1] == "R" ? "img/p4.png" : "img/p25.png";
                         break;
                     case "Monster":
                         temp = this.monster[temp[1] - 1].src;
                         break;
                     case "Key":
                         temp = temp[1] == "Y" ? "img/p8.png" : temp[1] == "R" ? "img/p12.png" : "img/p22.png";
                         break;
                     case "Wall":
                         temp = "img/p2.png";
                         break;
                     case "Jewel":
                         temp = temp[1] == "R" ? "img/p23.png" : "img/p14.png";
                         break;
                     case "Hero":
                         //  英雄落地后消除落地位置，离开时才确定回来的落地位置。
                         map[j][i] = ""
                         let temphero = {
                             node: null,
                             i: j,
                             j: i,
                             state: this.hero.state
                         }
                         temphero.node = new Node(i * radix.wid, j * radix.hei, "img/p7.png");
                         this.setHero(temphero)
                         temp = "img/p1.png"
                         break;
                     case "Last":
                         temp = "img/p6.png";
                         break;
                     case "Next":
                         temp = "img/p5.png";
                         break;
                     case "Boss":
                         temp = temp[1] == "1" ? "img/p30.png" : temp[1] == "2" ? "img/p31.png" : "img/p32.png";
                         break;
                     default:
                         temp = "img/p1.png"
                         break;
                 }
                 bgArr[i][j] = new Node(i * radix.wid, j * radix.hei, temp)
             }
         }
         // 赋值变量并绘制.
         this.bgArr = bgArr
         this.nodeDraw(bgArr)
     };
     // 可复用行创建方法.
     creatHero(temphero = this.getHero()) {
         // 赋值变量并绘制.
         this.setHero(temphero)
         setTimeout(() => this.nodeDraw(temphero.node), 50)
     };
     // 正式开始运行游玩代码。
     gameRun() {
         // 监听移动指令
         this.nodeMove();
         console.log("开始游戏！")
     };
     // 下列为工具接口------------------------------------------------------------------------------
     nodeDraw(node) {
         let ctx = this.ctx;
         let radix = this.radix;
         // 作判断,使函数能够接受单节点和节点数据的并处理
         if (node instanceof Array) {
             // 数组遍历节点绘制渲染
             node.forEach(arr => {
                 // 可以做个判断是否二维数组
                 arr.forEach(node => {
                     let img = new Image();
                     img.src = node.src;
                     // 异步监听事件，谁的资源先下载完毕先绘制，所以英雄需要等window加载完最后绘制。
                     img.onload = () => {
                         ctx.drawImage(img, node.pos_x, node.pos_y, radix.wid, radix.hei)
                     }
                 })
             })
         } else {
             // 单节点渲染
             let img = new Image();
             img.src = node.src;
             img.onload = () => {
                 ctx.drawImage(img, node.pos_x, node.pos_y, radix.wid, radix.hei)
             }
         }
     };
     // 移动方法,只能是英雄移动
     nodeMove() {
         let radix = this.radix;
         // 准备好修复原来地面.
         let prev = null;
         window.onkeydown = throttle((e) => {
             // 创建假英雄,尝试移动.
             let hero = JSON.parse(JSON.stringify(this.hero));
             // 移动前保留位置便于修改地面.
             prev = new Node(hero.node.pos_x, hero.node.pos_y, "img/p1.png");
             // 通过键盘入键修改英雄位置.
             switch (e.key) {
                 case "w":
                     // 移动英雄位置改变-数组中位置也改变.
                     hero.node.pos_y -= radix.hei;
                     hero.i -= 1;
                     break;
                 case "s":
                     hero.node.pos_y += radix.hei;
                     hero.i += 1;
                     break;
                 case "d":
                     hero.node.pos_x += radix.wid;
                     hero.j += 1;
                     break;
                 case "a":
                     hero.node.pos_x -= radix.wid;
                     hero.j -= 1;
                     break;
             }
             // 下一步判断是否产生碰撞,决定是否绘制下一步.
             // 注意点，hero是下一步的node和i、j状态，
             // 为了使state也变化需要将下一步hero传递进去。
             if (!this.collision(hero)) {
                 // 修补地面----------
                 this.nodeDraw(prev);
                 // 重新创建英雄-更新位置.
                 this.creatHero(hero);
             }
         }, 120)
     };

     // 碰撞函数
     collision(hero) {
         let size = this.size;
         let temp;
         // 先考虑下一步的位置是否有物体
         // 因为下一步可能边界外，所以先需要判断是否在地图内部,碰撞到边界true.
         if (hero.i < size && hero.i >= 0 && hero.j < size && hero.j >= 0)
             temp = this.map[hero.i][hero.j].split("_");
         else
             return true;
         // 该hero是走出下一步的hero,位置代表发生碰撞的位置,state代表hero自身
         // 通过定位可以下一步在地图上什么位置,有什么,三种大情况:
         // 碰撞可以击败的怪物击败覆盖,有钥匙打开门
         // 碰撞墙壁停止,碰撞没该钥匙的门停止,碰撞打不赢的怪停止,碰撞了墙壁停止
         // 碰撞了上下楼上下楼
         switch (temp[0]) {
             case "Blood":
             case "Key":
             case "Jewel":
                 return this.getThings(temp, hero)
             case "Monster":
                 return this.combat(temp[1], hero)
             case "Last":
             case "Next":
                 this.floorTo(temp[0])
             case "Wall":
                 break;
             case "Gate":
                 return this.openGate(temp[1], hero)
             case "Boss":
                 // 处理商人时间
                 this.Boss()
                 break;
             default:
                 return false;
         }
         return true;
     };
     // 战斗方法,互砍和状态更新
     combat(name, hero) {
         //  (下一步)英雄战斗全局数据跟随计算变化
         // 创建怪物副本,避免污染原数据.
         let monster = JSON.parse(JSON.stringify(this.monster[name - 1]));
         // 该hero是走出下一步的hero,位置代表发生碰撞的位置,state代表hero自身
         monster.blood += (monster.defense - hero.state.force) < 0 ? monster.defense - hero.state.force : -1
         while (monster.blood > 0) {
             hero.state.blood += (hero.state.defense - monster.force) < 0 ? (hero.state.defense - monster.force) : -1
             if (hero.state.blood < 0 || (hero.state.defense == monster.force && monster.defense == hero.state.force)) {
                 // alert("你死了!ψ(._. )>");
                 // // 死亡处理....
                 // 保护机制-----------------
                 console.log(`你打不赢!ψ(._. )>! <br>预计战斗结果:英雄血量低于0，怪物血量剩于${monster.blood}`)
                 this.video("can't_win")
                 return true
             }
             monster.blood += (monster.defense - hero.state.force) < 0 ? monster.defense - hero.state.force : -1
         }
         this.video("kill")
         hero.state.exp = (hero.state.exp * 10 + monster.exp * 10) / 10;
         let temp = window.onkeydown;
         while (hero.state.exp >= hero.state.expNeed) {
             hero.state.exp = (hero.state.exp * 10 - hero.state.expNeed * 10) / 10;
             hero.state.expNeed = (hero.state.expNeed * 1.5).toFixed(1);
             hero.state.force += 1.5
             hero.state.defense += 1
             hero.state.blood += 200
             console.log("经验充足，英雄升级！", hero.state);
             //  延迟播放升级(实际需要暂停)
             window.onkeydown = null
             setTimeout(() => {
                 this.video("levelup")
                 window.onkeydown = temp
             }, 600)
         }
         console.log(`战斗结果:英雄血量剩于${hero.state.blood}，怪物已死，升到下一级级还需${hero.state.expNeed-hero.state.exp}`);
         // 怪物倒下，删除地图中对应字符
         this.map[hero.i][hero.j] = ""
         return false
     };
     // 获取物品的处理方法
     getThings(name, hero) {
         if (name[0] == "Blood") {
             if (name[1] == "R") {
                 hero.state.blood += 150
                 console.log("喝下红色药剂，增加点200血量")
             } else if (name[1] == "B") {
                 hero.state.blood += 400
                 console.log("喝下蓝色药剂，增加点500血量")
             }
             this.video("addblood")
         } else if (name[0] == "Key") {
             if (name[1] == "Y") {
                 hero.state.key[0] += 1
                 console.log("获得黄色钥匙一把")
             } else if (name[1] == "R") {
                 hero.state.key[1] += 1
                 console.log("获得红色钥匙一把")
             } else if (name[1] == "B") {
                 hero.state.key[2] += 1
                 console.log("获得蓝色钥匙一把")
             }
         } else if (name[0] == "Jewel") {
             if (name[1] == "R") {
                 hero.state.force += 2
                 console.log("拾取红宝石，提升攻击力3点数值")
             } else if (name[1] == "B") {
                 hero.state.defense += 1
                 console.log("拾取蓝宝石，提升防御力2点数值")
             }
         }
         // 完成拾取操作，删除地图上对应字符
         this.map[hero.i][hero.j] = ""
         return false
     };
     // 开关门
     openGate(gatecolor, hero) {
         // true是发生碰撞
         if (gatecolor == "Y") {
             if (hero.state.key[0] - 1 >= 0)
                 hero.state.key[0]--;
             else
                 return console.log("没有黄色钥匙！( ´･･)ﾉ(._.`)") || true
         } else if (gatecolor == "R") {
             if (hero.state.key[1] - 1 >= 0)
                 hero.state.key[1]--;
             else
                 return console.log("没有红色钥匙！( ´･･)ﾉ(._.`)") || true
         } else if (gatecolor == "B") {
             if (hero.state.key[2] - 1 >= 0)
                 hero.state.key[2]--;
             else
                 return console.log("没有蓝色钥匙！( ´･･)ﾉ(._.`)") || true
         }
         this.video("open_gate")
             // 用钥匙打开门，删除地图中对应字符
         this.map[hero.i][hero.j] = ""
         return false
     };
     // 楼层移动，地图和界面初始化。
     floorTo(name) {
         log(this.data)
         let floor = this.floor;
         // 回到以前的楼层中时，应该出现正确的位置。
         if (name == "Last") {
             this.setOther(--floor, "floor");
             this.map[this.hero.i][this.hero.j] = "Hero"
         } else if (name == "Next") {
             this.setOther(++floor, "floor");
             this.map[this.hero.i][this.hero.j] = "Hero"
         }
         // 取出其中一幅地图
         this.map = this.data.maps[floor - 1];
         // 生成点阵图数组，渲染地图。
         this.createBackground();
         // 重新定位英雄
         this.creatHero();
         console.log(`更换楼层o((>ω< ))o，已到第${floor}层`)
     };
     // BOSS战!!
     Boss() {
         let hero = this.getHero()
         let BOSS = {
             name: "BOSS",
             blood: 8000,
             force: 100,
             defense: 40,
         }
         BOSS.blood += (BOSS.defense - hero.state.force) < 0 ? BOSS.defense - hero.state.force : -1
         while (BOSS.blood > 0) {
             hero.state.blood += (hero.state.defense - BOSS.force) < 0 ? (hero.state.defense - BOSS.force) : -1
             if (hero.state.blood < 0 || (hero.state.defense == BOSS.force && BOSS.defense == hero.state.force)) {
                 console.log(`很遗憾的(⊙x⊙;)! <br>战斗结果:英雄血量低于0，BOSS血量还剩于${BOSS.blood}`)
                 window.onkeydown = throttle(() => {
                     alert("别动了，你都死了!(╯‵□′)╯︵┻━┻");
                 }, 100)
                 alert("你死了!ψ(._. )>");
                 return false
             }
             BOSS.blood += (BOSS.defense - hero.state.force) < 0 ? BOSS.defense - hero.state.force : -1
         }
         console.log(`恭喜玩家获得最总的优胜! <br>战斗结果:英雄血量剩于${hero.state.blood}，大BOSS已被击杀！`)
         window.onkeydown = throttle(() => {
             alert("别点了，你都通关了!(≧∀≦)ゞ");
         }, 100)
         alert("游戏结束!你战胜了最后的BOSS(*/ω＼*)");
     };
     // 下列为set和get方法（劫持数据以便数据可视化）-----------------------------------------------------------------------
     getHero(va = null, subva = null) {
         //  深拷贝
         let hero = JSON.parse(JSON.stringify(this.hero))
         if (va == null)
             return hero
         else if (subva == null)
             return hero[va]
         else
             return hero[va][subva]
     }
     setHero(value, va = null, subva = null) {
         if (va == null)
             this.hero = value
         else if (subva == null)
             this.hero[va] = value
         else
             this.hero[va][subva] = value
         this.show("hero")
     }
     setOther(value, va) {
         this[va] = value
         this.show(va)
     };
     //  负责数据可视化。
     show(name) {
             let divs = [];
             document.querySelectorAll(".msg>div").forEach(div => {
                 if (div.id.split("_")[0] == name)
                     divs.push(div)
             })
             switch (name) {
                 case "hero":
                     let hero = this.getHero().state
                     divs.forEach(div => {
                         let vaname = div.id.split("_")[1]
                         if (vaname == "key")
                             div.children[0].innerHTML = `黄 ${hero[vaname][0]} 红 ${hero[vaname][1]} 蓝 ${hero[vaname][2]}`
                         else
                             div.children[0].innerHTML = hero[vaname]
                     })
                     break;
                 case "floor":
                     divs.forEach(div => {
                         div.children[0].innerHTML = this.floor
                     })
             }
         }
         //  负责音效触发。
     video(name) {
         if (document.body.lastElementChild.className == "video")
             document.body.removeChild(document.body.lastElementChild)
         let mp3 = document.createElement('div');
         mp3.classList.add("video")
         mp3.innerHTML = `<video  src="vudio/${name}.mp3" autoplay> </video>`;
         document.body.appendChild(mp3)
     }
 };



 // 节流函数
 function throttle(fn, timeout) {
     let time = true;
     return (e) => {
         if (!time)
             return false
         time = false;
         setTimeout(() => {
             fn(e);
             time = true;
         }, timeout)
     }
 }