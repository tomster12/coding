(()=>{"use strict";var e={n:t=>{var s=t&&t.__esModule?()=>t.default:()=>t;return e.d(s,{a:s}),s},d:(t,s)=>{for(var n in s)e.o(s,n)&&!e.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:s[n]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const t=require("fs");var s=e.n(t);const n=require("blessed");var i=e.n(n);const o=require("socket.io-client");var r=e.n(o);class l{constructor(e,t,s,n){this.gameScreen=e,this.nextEl=s,this.el=i().box(Object.assign(Object.assign({parent:t},n),{border:{type:"line"},style:{border:{fg:"white"},focus:{border:{fg:"blue"}}}})),this.el.key("tab",((e,t)=>this.nextEl.focus())),this.el.content="No Realm loaded..."}focus(){this.el.focus()}}class h{constructor(e,t,s,n){this.gameScreen=e,this.nextEl=s,this.canInput=!1,this.isInputting=!1,this.toClear=!1,this.onSubmit=null,this.el=i().textarea(Object.assign(Object.assign({parent:t},n),{height:1,keys:!0,tags:!0,style:{bg:"null",fg:"white",focus:{bg:"blue",fg:"white"}}})),this.el.key("tab",((e,t)=>{this.interruptInput()&&(this.nextEl.focus(),this.gameScreen.rerender())})),this.el.key("enter",((e,t)=>{this.submitInput()&&this.gameScreen.rerender()})),this.el.key("escape",((e,t)=>{this.interruptInput()&&this.gameScreen.rerender()})),this.el.setValue("Type 'help' for a list of commands..."),this.toClear=!0}startInput(e){return!!this.canInput&&!this.isInputting&&((this.toClear||e)&&(this.el.clearValue(),this.toClear=!1),this.el.readInput(),this.gameScreen.rerender(),this.isInputting=!0,!0)}submitInput(){if(!this.isInputting)return!1;const e=this.el.getValue();return null!=this.onSubmit&&this.onSubmit(e),this.el.submit(),this.isInputting=!1,this.el.setValue("Type 'help' for a list of commands..."),this.toClear=!0,!0}interruptInput(){if(!this.isInputting)return!1;let e=this.el.getValue().trimEnd();return this.el.setValue(e),this.el.cancel(),this.isInputting=!1,""==this.el.getValue()&&(this.el.setValue("Type 'help' for a list of commands..."),this.toClear=!0),!0}focus(){this.el.focus()}}class c{constructor(e,t,s){this.el=i().box(Object.assign(Object.assign({parent:t},s),{style:{bg:"red"}})),this.isActive=!1}setActive(e){const t=e?"green":"red";this.el.style.bg=t}}class u{constructor(){this.isConstructed=!0,this.onDestroy=null,this.initElements(),this.el_pnlb.focus(),this.rerender()}initElements(){this.el_screen=i().screen({title:"File Explorer",smartCSR:!0,useBCE:!0,ignoreDockContrast:!0}),this.el_menu=i().listbar({parent:this.el_screen,width:`100%-${u.LOGIN_WIDTH}`,height:3,keys:!0,autoCommandKeys:!1,border:{type:"line"},style:{prefix:{fg:"green"},item:{fg:"white"},focus:{selected:{bg:"blue"},border:{fg:"blue"}}},commands:[{prefix:"q",text:"exit",callback:()=>{this.destroy()}},{prefix:"o",text:"options",callback:()=>{this.log("[Options]\n")}},{prefix:"h",text:"help",callback:()=>{this.log("[Help]\n")}}]}),this.el_user=i().box({parent:this.el_screen,width:u.LOGIN_WIDTH,height:3,top:0,right:0,tags:!0,content:"{center}{green-fg}r{/}:Register{/}",border:{type:"line"},style:{border:{fg:"white"},focus:{border:{fg:"blue"}}}}),this.el_pnlr=i().box({parent:this.el_screen,right:0,top:3,bottom:3,width:`100%-${u.PNLL_WIDTH}`,scrollable:!0,alwaysScroll:!0,keys:!0,tags:!0,scrollbar:{style:{bg:"green"},track:{bg:"#ffffff"}},border:{type:"line"},style:{border:{fg:"white"},focus:{border:{fg:"blue"}}}}),this.el_pnlr.pushLine(" "),this.el_pnlb=i().box({parent:this.el_screen,left:0,right:0,bottom:0,width:"100%",height:3,tags:!0,content:"{green-fg}i{/}:>",border:{type:"line"},style:{border:{fg:"white"},focus:{border:{fg:"blue"}}}}),this.el_directory=new l(this,this.el_screen,this.el_pnlr,{left:0,top:3,bottom:3,width:u.PNLL_WIDTH}),this.el_prompt=new h(this,this.el_pnlb,this.el_menu,{left:4,right:2,width:"100%-7",height:3}),this.el_statusConnect=new c(this,this.el_menu,{top:0,right:4,width:2,height:1}),this.el_statusLogin=new c(this,this.el_menu,{top:0,right:1,width:2,height:1}),this.el_pnlr.key("tab",((e,t)=>this.el_pnlb.focus())),this.el_pnlb.key("tab",((e,t)=>this.el_menu.focus())),this.el_menu.key("tab",((e,t)=>this.el_user.focus())),this.el_user.key("tab",((e,t)=>this.el_directory.focus())),this.el_screen.key("q",((e,t)=>{this.el_menu.focus(),this.el_menu.selectTab(0)})),this.el_screen.key("o",((e,t)=>{this.el_menu.focus(),this.el_menu.selectTab(1)})),this.el_screen.key("h",((e,t)=>{this.el_menu.focus(),this.el_menu.selectTab(2)})),this.el_screen.key("i",((e,t)=>{this.el_prompt.startInput()})),this.el_pnlr.on("focus",(()=>{this.el_pnlr.setScroll(this.el_pnlr.getLines().length-1),this.rerender()})),this.el_pnlb.key("enter",((e,t)=>{this.el_prompt.startInput()&&this.rerender()})),this.el_pnlb.key("backspace",((e,t)=>{this.el_prompt.startInput(!0)&&this.rerender()})),this.el_menu.on("blur",(()=>{this.el_menu.select(0),this.rerender()}))}log(e,t,s){let n=" "+e;null!=s&&(n=n.padEnd(s," ")),null!=t&&(n=`{${t}-bg}${n}{/}`),this.el_pnlr.pushLine(n),this.el_pnlr.setScroll(this.el_pnlr.getLines().length-1),this.rerender()}logLine(e=45){this.el_pnlr.pushLine("─".repeat(e)),this.el_pnlr.setScroll(this.el_pnlr.getLines().length-1),this.rerender()}rerender(){this.el_screen.render()}destroy(){this.isConstructed&&(this.isConstructed=!1,this.el_screen.destroy(),null!=this.onDestroy&&this.onDestroy())}setUser(e){this.el_user.setContent(`{center}${e}{/}`)}}u.PNLL_WIDTH=35,u.LOGIN_WIDTH=15;class g{constructor(){this.initScreen(),this.initConnection()}initScreen(){this.screen=new u,this.screen.onDestroy=()=>this.socket.disconnect(),this.screen.el_prompt.onSubmit=e=>this.runCommand(e),this.screen.el_screen.key("r",((e,t)=>{null==this.validAuth&&(this.screen.el_user.focus(),this.initSession(!0))})),this.screen.el_user.key("enter",((e,t)=>{null==this.validAuth&&(this.screen.el_user.focus(),this.initSession(!0))}))}initConnection(){this.screen.log("--- Attempting connection and login ---"),this.screen.log(" "),this.screen.logLine(g.CNCT_LOG_WIDTH),this.logConnectionInfo(" ");const e="http://localhost:3000";this.socket=r()(e),this.logConnectionInfo(`Connecting to ${e}...`),this.socket.on("connect",(()=>{this.screen.el_statusConnect.setActive(!0),this.logConnectionInfo("Successfully connected!"),this.logConnectionInfo(" "),this.initSession()})),this.socket.on("disconnect",(()=>{this.screen.isConstructed?(this.validAuth=null,this.screen.el_prompt.canInput=!1,this.screen.el_statusConnect.setActive(!1),this.screen.el_statusLogin.setActive(!1),this.screen.log("Disconnected!\n"),this.screen.log("--- Attempting connection and login ---"),this.screen.logLine(g.CNCT_LOG_WIDTH),this.logConnectionInfo(" "),this.logConnectionInfo(`Reconnecting to ${e}...`)):console.log("File Explorer exited.")}))}initSession(e=!1){e&&(this.screen.log("--- Attempting login ---"),this.screen.log(" "),this.screen.logLine(g.CNCT_LOG_WIDTH),this.logConnectionGap()),this.logConnectionInfo("Searching for .user file..."),s().readFile(".user","utf8",((e,t)=>{if(e)this.logConnectionInfo("No .user detected! prompting..."),this.logConnectionGap(),this.promptNewUser();else{const e=JSON.parse(t);this.logConnectionInfo(`Found .user for ( ${e.userID} : ${e.token} )`),this.logConnectionInfo("Requesting login..."),this.logConnectionGap(),this.sendLoginRequest(e)}}))}promptNewUser(){i().prompt({parent:this.screen.el_screen,width:"half",height:"shrink",top:"center",left:"center",label:" {blue-fg}Register{/blue-fg} ",tags:!0,border:"line"}).input("Username:","",((e,t)=>{e||null==t||null==t||""==t?(this.logConnectionInfo("No userID inputted!"),this.logConnectionGap(),this.screen.logLine(g.CNCT_LOG_WIDTH)):(this.logConnectionInfo(`Registering user '${t}'...`),this.logConnectionGap(),this.sendRegisterRequest(t))}))}sendRegisterRequest(e){this.socket.emit("requestRegister",e,(t=>{t.accepted?(this.validAuth=t.userAuth,this.logConnectionInfo(`Successfully registered account for '${t.userAuth.userID}'!`),this.logConnectionInfo("Overwriting .user with new user details."),this.logConnectionGap(),s().writeFile(".user",JSON.stringify(t.userAuth),(e=>{e&&(this.logConnectionInfo("Failed to write .user! You may have issues on next login."),this.logConnectionGap())})),this.screen.logLine(g.CNCT_LOG_WIDTH),this.screen.log(" "),this.onLoggedIn()):(this.logConnectionInfo(`Could not register userID '${e}'.`),this.logConnectionInfo(`Reason: ${t.reason}.`),this.logConnectionGap(),this.screen.logLine(g.CNCT_LOG_WIDTH),this.screen.log(" "))}))}sendLoginRequest(e){this.socket.emit("requestLogin",e,(t=>{t?(this.screen.log(`Successful login, Welcome ${e.userID}!`,g.CNCT_LOG_COLOR,g.CNCT_LOG_WIDTH),this.logConnectionGap(),this.screen.logLine(g.CNCT_LOG_WIDTH),this.screen.log(" "),this.validAuth=e,this.onLoggedIn()):(this.logConnectionInfo(`Could not login with userID '${e.userID}'.`),this.logConnectionInfo("invalid .user, deleting..."),this.logConnectionGap(),s().unlink(".user",(e=>{})),this.screen.logLine(g.CNCT_LOG_WIDTH),this.screen.log(" "))}))}onLoggedIn(){this.screen.el_statusLogin.setActive(!0),this.screen.setUser(this.validAuth.userID),this.screen.log("Welcome to File Explorer! Type 'help' into the prompt to get started.\n"),this.screen.el_prompt.canInput=!0,this.socket.emit("getRealm",this.validAuth,(e=>{this.screen.log(JSON.stringify(e))}))}logConnectionInfo(e){this.screen.log(e,g.CNCT_LOG_COLOR,g.CNCT_LOG_WIDTH)}logConnectionGap(){this.screen.log(" ",g.CNCT_LOG_COLOR,g.CNCT_LOG_WIDTH)}runCommand(e){""!=(e=e.trimEnd())&&this.screen.log("> "+e+"\n")}}g.CNCT_LOG_COLOR="blue",g.CNCT_LOG_WIDTH=75,new g})();