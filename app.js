(function(){
var KEY="habit-tracker-damola-v1",MN=["January","February","March","April","May","June","July","August","September","October","November","December"],DN=["Su","Mo","Tu","We","Th","Fr","Sa"];
var now=new Date(),S={habits:[],checks:{},well:{},today:{},goals:[],ua:0,y:now.getFullYear(),m:now.getMonth()};
function load(){try{var r=localStorage.getItem(KEY);if(r){var d=JSON.parse(r);if(d&&d.habits)S.habits=d.habits,S.checks=d.checks||{},S.well=d.well||{},S.today=d.today||{},S.goals=d.goals||[],S.ua=d.ua||0}}catch(e){}
 if(!S.habits.length){S.habits=["Code (2+ hrs)","ReachCare testing","MyTab","Vetted Hands","Masters prep","Workout","Read / learn","Plan the day","Sleep by 11pm"].map(function(n,i){return{id:"h"+i,name:n}});S.goals=[["Masters","Shortlist programs and schools"],["Masters","Check entry requirements and deadlines"],["Masters","Draft statement of purpose"],["Masters","Line up referees"],["Masters","Update CV and project portfolio"],["ReachCare","Close open bugs from testing"],["MyTab","Ship first version"],["Vetted Hands","Ship first version"]].map(function(g,i){return{id:"g"+i,c:g[0],t:g[1],d:false}})}}
function snap(){return{habits:S.habits,checks:S.checks,well:S.well,today:S.today,goals:S.goals,ua:S.ua||0}}
function save(){S.ua=Date.now();try{localStorage.setItem(KEY,JSON.stringify(snap()))}catch(e){}push()}
function applyData(d){S.habits=d.habits||[];S.checks=d.checks||{};S.well=d.well||{};S.today=d.today||{};S.goals=d.goals||[];S.ua=d.ua||0;try{localStorage.setItem(KEY,JSON.stringify(snap()))}catch(e){}render()}
/* ---- Cloud sync (Supabase). The anon key is public by design; row-level security protects data. ---- */
var SB_URL="https://hbdxnixgkqsxkoksdacf.supabase.co",SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZHhuaXhna3FzeGtva3NkYWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjQ5NzUsImV4cCI6MjA5MzUwMDk3NX0._JVX3juBF8qe59HDd7hRkUP9c-wGrVFBwy0uvIwns4o",TABLE="habit_tracker_data",sb=null,user=null,pt=null;
try{if(window.supabase)sb=window.supabase.createClient(SB_URL,SB_KEY)}catch(e){}
function status(t){var e=document.getElementById("cmsg");if(e)e.textContent=t}
function ui(){document.getElementById("aout").hidden=!user;document.getElementById("ain").hidden=!!user;document.getElementById("aemail").textContent=user?user.email:""}
function push(){if(!sb||!user)return;clearTimeout(pt);pt=setTimeout(function(){status("Syncing...");
 sb.from(TABLE).upsert({user_id:user.id,data:snap(),updated_at:new Date().toISOString()}).then(function(r){status(r.error?"Sync failed. It will retry on your next change.":"Synced")},function(){status("Offline. It will sync on your next change.")})},1200)}
function pull(){if(!sb||!user)return;
 sb.from(TABLE).select("data").eq("user_id",user.id).maybeSingle().then(function(r){
  if(r.error){status("Could not load cloud data.");return}
  if(r.data&&r.data.data&&(r.data.data.ua||0)>(S.ua||0)){applyData(r.data.data);status("Loaded from cloud")}else push()},function(){status("Offline. Using data on this device.")})}
function auth(fn){var e=document.getElementById("em").value.trim(),p=document.getElementById("pw").value;
 if(!e||p.length<6){status("Enter your email and a password of 6+ characters.");return}
 status("Working...");sb.auth[fn]({email:e,password:p}).then(function(r){
  if(r.error){status(r.error.message);return}
  if(fn==="signUp"&&!r.data.session){status("Check your email to confirm your account, then sign in.");return}
  document.getElementById("pw").value=""})}
function cloudInit(){
 if(!sb){status("Cloud sync unavailable right now. Your data stays on this device.");return}
 document.getElementById("si").onclick=function(){auth("signInWithPassword")};
 document.getElementById("su").onclick=function(){auth("signUp")};
 document.getElementById("so").onclick=function(){sb.auth.signOut();status("Signed out. Data stays on this device.")};
 sb.auth.onAuthStateChange(function(ev,sess){user=sess&&sess.user||null;ui();if(user)setTimeout(pull,0)});
 document.addEventListener("visibilitychange",function(){if(!document.hidden)pull()});
}
function $(i){return document.getElementById(i)}
function mk(){return S.y+"-"+S.m}
function days(){return new Date(S.y,S.m+1,0).getDate()}
function get(id){var c=S.checks[mk()]||{};return c[id]||[]}
function weeks(){var n=days(),w=[],cur=[],f=new Date(S.y,S.m,1).getDay();
 for(var d=1;d<=n;d++){cur.push(d);if((f+d-1)%7===6||d===n){w.push(cur);cur=[]}}return w}
function pct(a,b){return b?Math.round(a/b*100):0}
function toggle(id,d){var k=mk();S.checks[k]=S.checks[k]||{};var a=S.checks[k][id]||[],i=a.indexOf(d);if(i<0)a.push(d);else a.splice(i,1);S.checks[k][id]=a;save();render()}
function esc(s){return s.replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

function render(){render0();extra()}
function render0(){
 var n=days(),W=weeks(),H=S.habits,g=$("grid"),h="";
 var first=new Date(S.y,S.m,1).getDay(),isNow=S.y===now.getFullYear()&&S.m===now.getMonth();
 h+='<tr><th class="hn"></th>'+W.map(function(w,i){return'<th class="wk" colspan="'+w.length+'">Week '+(i+1)+'</th>'}).join("")+'</tr>';
 h+='<tr><th class="hn"></th>';
 for(var d=1;d<=n;d++)h+='<th class="dh">'+DN[(first+d-1)%7]+'<b>'+d+'</b></th>';
 h+='</tr>';
 H.forEach(function(x){var a=get(x.id);
  h+='<tr><th class="hn" title="'+esc(x.name)+'">'+esc(x.name)+'</th>';
  for(var d=1;d<=n;d++){var on=a.indexOf(d)>-1;
   h+='<td><button class="cell'+(isNow&&d>now.getDate()?' future':'')+'" aria-pressed="'+on+'" aria-label="'+esc(x.name)+' day '+d+'" data-h="'+x.id+'" data-d="'+d+'"></button></td>'}
  h+='</tr>'});
 g.innerHTML=h;
 if(!H.length)g.innerHTML='<tr><td class="empty">No habits yet. Add your first one below.</td></tr>';

 var tot=0,done=0,per=H.map(function(x){var c=get(x.id).filter(function(d){return d<=n}).length;tot+=n;done+=c;return{x:x,c:c}});
 $("sg").textContent=tot;$("sc").textContent=done;$("sl").textContent=tot-done;

 var p=pct(done,tot),C=2*Math.PI*38;
 $("don").innerHTML='<circle cx="50" cy="50" r="38" fill="none" stroke="var(--acc2)" stroke-width="14"/><circle cx="50" cy="50" r="38" fill="none" stroke="var(--acc)" stroke-width="14" stroke-dasharray="'+(C*p/100)+' '+C+'" transform="rotate(-90 50 50)"/><text x="50" y="56" text-anchor="middle" font-size="20" font-weight="800" fill="var(--ink)">'+p+'%</text>';

 var bw=W.map(function(w){var c=0;H.forEach(function(x){var a=get(x.id);w.forEach(function(d){if(a.indexOf(d)>-1)c++})});return pct(c,H.length*w.length)}),bs="",bwid=Math.min(40,260/W.length);
 [0,50,100].forEach(function(v){var y=115-v*.95;bs+='<line x1="34" x2="316" y1="'+y+'" y2="'+y+'" stroke="var(--line)"/><text x="30" y="'+(y+3)+'" text-anchor="end" font-size="9" fill="var(--mute)">'+v+'%</text>'});
 bw.forEach(function(v,i){var x=44+i*(272/W.length)+(272/W.length-bwid)/2,hh=v*.95;
  bs+='<rect x="'+x+'" y="'+(115-hh)+'" width="'+bwid+'" height="'+hh+'" rx="4" fill="var(--acc)"/><text x="'+(x+bwid/2)+'" y="'+(112-hh)+'" text-anchor="middle" font-size="9" fill="var(--ink)">'+(v?v+'%':'')+'</text><text x="'+(x+bwid/2)+'" y="132" text-anchor="middle" font-size="10" fill="var(--mute)">Wk '+(i+1)+'</text>'});
 $("wk").innerHTML=bs;

 var sorted=per.slice().sort(function(a,b){return b.c-a.c}).slice(0,10);
 $("top").innerHTML=sorted.length?sorted.map(function(o,i){return'<div class="rank"><em>'+(i+1)+'</em>'+esc(o.x.name)+'<span>'+pct(o.c,n)+'%</span></div>'}).join(""):'<div class="empty">Nothing yet.</div>';

 $("ana").innerHTML=per.length?'<div class="row h"><span>Habit</span><span class="r">Goal</span><span class="r">Done</span><span class="r">Left</span></div>'+per.map(function(o){
  return'<div class="row"><span class="n">'+esc(o.x.name)+' <b>'+pct(o.c,n)+'%</b></span><span class="r">'+n+'</span><span class="r">'+o.c+'</span><span class="r">'+(n-o.c)+'</span><div class="bar"><i style="width:'+pct(o.c,n)+'%"></i></div></div>'}).join(""):'<div class="empty">Add a habit to see analysis.</div>';
}


function extra(){
 var n=days(),t=new Date(),isNow=S.y===t.getFullYear()&&S.m===t.getMonth();
 $("man").innerHTML=S.habits.length?S.habits.map(function(x){
  var a=get(x.id).slice().sort(function(p,q){return p-q}),best=0,run=0,prev=-9,set={};
  a.forEach(function(d){run=d===prev+1?run+1:1;prev=d;set[d]=1;if(run>best)best=run});
  var e=isNow?t.getDate():n;if(isNow&&!set[e])e--;var cur=0;while(e>0&&set[e]){cur++;e--}
  return'<div class="mrow"><input value="'+esc(x.name)+'" data-r="'+x.id+'" maxlength="40" aria-label="Rename habit"><span class="st">Streak '+cur+' | Best '+best+'</span><button class="btn" data-x="'+x.id+'">Delete</button></div>'}).join(""):'<div class="empty">No habits yet.</div>';
 var wd=S.well[mk()]||{},h='<tr><th class="hn">Day</th>',d,o;
 for(d=1;d<=n;d++)h+='<th class="dh"><b>'+d+'</b></th>';
 h+='</tr><tr><th class="hn">Mood (1-5)</th>';
 for(d=1;d<=n;d++){var m=(wd[d]||{}).mood;o='<option value="">-</option>';for(var i=1;i<=5;i++)o+='<option'+(m==i?' selected':'')+'>'+i+'</option>';h+='<td><select class="wm" data-d="'+d+'" aria-label="Mood day '+d+'">'+o+'</select></td>'}
 h+='</tr><tr><th class="hn">Sleep (hrs)</th>';
 for(d=1;d<=n;d++){var sl=(wd[d]||{}).sleep;h+='<td><input class="ws" type="number" min="0" max="24" step="0.5" data-d="'+d+'" value="'+(sl==null?'':sl)+'" aria-label="Sleep hours day '+d+'"></td>'}
 $("well").innerHTML=h+'</tr>';drawWell();todayGoals();
}
function drawWell(){
 var n=days(),wd=S.well[mk()]||{},mp=[],sp=[],ms=0,mc=0,ss=0,sc=0,W=280,x0=30;
 for(var d=1;d<=n;d++){var w=wd[d]||{},x=x0+(d-1)*(W/Math.max(n-1,1));
  if(w.mood!=null){mp.push(x+','+(105-(w.mood-1)*22));ms+=w.mood;mc++}
  if(w.sleep!=null){sp.push(x+','+(105-Math.min(w.sleep,12)*8));ss+=w.sleep;sc++}}
 var g='';[[1,'1'],[3,'3'],[5,'5']].forEach(function(v){var y=105-(v[0]-1)*22;g+='<line x1="'+x0+'" x2="'+(x0+W)+'" y1="'+y+'" y2="'+y+'" stroke="var(--line)"/><text x="24" y="'+(y+3)+'" text-anchor="end" font-size="9" fill="var(--mute)">'+v[1]+'</text>'});
 function line(p,c){return p.length>1?'<polyline points="'+p.join(' ')+'" fill="none" stroke="'+c+'" stroke-width="2" stroke-linejoin="round"/>':(p.length?'<circle cx="'+p[0].split(',')[0]+'" cy="'+p[0].split(',')[1]+'" r="3" fill="'+c+'"/>':'')}
 $("wchart").innerHTML=g+line(sp,'var(--warn)')+line(mp,'var(--acc)');
 $("wavg").textContent=(mc?'Avg mood '+(ms/mc).toFixed(1):'')+(mc&&sc?' | ':'')+(sc?'Avg sleep '+(ss/sc).toFixed(1)+'h':'');
}
function bind(){
 $("man").addEventListener("change",function(e){var r=e.target.dataset.r;if(!r)return;var v=e.target.value.trim();
  S.habits.forEach(function(x){if(x.id===r&&v)x.name=v});save();render()});
 $("man").addEventListener("click",function(e){var b=e.target.closest("[data-x]");if(!b)return;
  if(!b.dataset.c){b.dataset.c=1;b.textContent="Tap again";return}
  S.habits=S.habits.filter(function(x){return x.id!==b.dataset.x});save();render()});
 $("well").addEventListener("change",function(e){var t=e.target,d=t.dataset.d;if(!d)return;
  var k=mk();S.well[k]=S.well[k]||{};var w=S.well[k][d]=S.well[k][d]||{},v=t.value===""?null:+t.value,f=t.classList.contains("wm")?"mood":"sleep";
  if(f==="sleep"&&v!=null)v=Math.max(0,Math.min(24,v));
  if(v==null)delete w[f];else w[f]=v;save();drawWell()});
 $("bk").onclick=function(){var t=$("bkt");t.value=JSON.stringify({habits:S.habits,checks:S.checks,well:S.well,today:S.today,goals:S.goals});t.select();
  var ok=false;try{ok=document.execCommand("copy")}catch(x){}$("bmsg").textContent=ok?"Backup copied.":"Copy the text above and keep it somewhere safe."};
 $("rs").onclick=function(){try{var d=JSON.parse($("bkt").value);if(!d||!Array.isArray(d.habits))throw 0;
  S.habits=d.habits;S.checks=d.checks||{};S.well=d.well||{};S.today=d.today||{};S.goals=d.goals||[];save();render();$("bmsg").textContent="Restored."}catch(x){$("bmsg").textContent="That text is not a valid backup."}};
}

function tk(){var t=new Date();return t.getFullYear()+"-"+t.getMonth()+"-"+t.getDate()}
function todayGoals(){
 var a=S.today[tk()]||[],h="",i;
 for(i=0;i<3;i++){var o=a[i]||{t:"",d:false};h+='<div class="trow"><button class="cell" style="margin:0;flex:none" aria-pressed="'+!!o.d+'" data-i="'+i+'" aria-label="Priority '+(i+1)+' done"></button><input data-i="'+i+'" value="'+esc(o.t||"")+'" maxlength="80" placeholder="Priority '+(i+1)+'" aria-label="Priority '+(i+1)+'"></div>'}
 $("tt").innerHTML=h;
 var G=S.goals,dn=G.filter(function(g){return g.d}).length;
 $("gl").innerHTML=(G.length?'<div class="hint" style="margin-bottom:6px">'+dn+' of '+G.length+' done</div>':'<div class="empty">No goals yet. Add one below.</div>')+G.map(function(g){return'<div class="trow"><button class="cell" style="margin:0;flex:none" aria-pressed="'+!!g.d+'" data-g="'+g.id+'" aria-label="Goal done"></button><span style="flex:1;'+(g.d?'text-decoration:line-through;color:var(--mute)':'')+'">'+esc(g.t)+'</span><span class="st">'+esc(g.c)+'</span><button class="btn" data-gx="'+g.id+'" aria-label="Delete goal">&times;</button></div>'}).join("");
}
function bind2(){
 $("tt").addEventListener("change",function(e){var i=e.target.dataset.i;if(i==null||e.target.tagName!=="INPUT")return;var k=tk(),a=S.today[k]=S.today[k]||[];a[i]=a[i]||{t:"",d:false};a[i].t=e.target.value.trim();save()});
 $("tt").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var i=b.dataset.i,k=tk(),a=S.today[k]=S.today[k]||[];a[i]=a[i]||{t:"",d:false};a[i].d=!a[i].d;save();todayGoals()});
 $("gl").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;
  if(b.dataset.g){S.goals.forEach(function(g){if(g.id===b.dataset.g)g.d=!g.d})}
  else if(b.dataset.gx){S.goals=S.goals.filter(function(g){return g.id!==b.dataset.gx})}else return;save();todayGoals()});
 $("ga").onclick=function(){var v=$("gi").value.trim();if(!v)return;S.goals.push({id:"g"+Date.now(),t:v,c:$("gc").value,d:false});$("gi").value="";save();todayGoals()};
 $("gi").onkeydown=function(e){if(e.key==="Enter")$("ga").onclick()};
}
function init(){
 load();
 $("mon").innerHTML=MN.map(function(m,i){return'<option value="'+i+'">'+m+'</option>'}).join("");
 var ys="";for(var y=now.getFullYear()-2;y<=now.getFullYear()+2;y++)ys+='<option>'+y+'</option>';
 $("yr").innerHTML=ys;$("mon").value=S.m;$("yr").value=S.y;
 $("mon").onchange=function(){S.m=+this.value;render()};
 $("yr").onchange=function(){S.y=+this.value;render()};
 $("grid").addEventListener("click",function(e){var b=e.target.closest(".cell");if(b)toggle(b.dataset.h,+b.dataset.d)});
 function add(){var v=$("newh").value.trim();if(!v)return;S.habits.push({id:"h"+Date.now(),name:v});$("newh").value="";save();render()}
 $("addb").onclick=add;bind();bind2();cloudInit();$("newh").onkeydown=function(e){if(e.key==="Enter")add()};
 $("theme").onclick=function(){var r=document.documentElement,d=r.getAttribute("data-theme");
  var cur=d||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");r.setAttribute("data-theme",cur==="dark"?"light":"dark")};
 render();
}
init();
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}
})();
