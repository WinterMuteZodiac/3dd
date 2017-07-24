var width; //window.innerWidth;
var height; //window.innerHeight;
var rad = 3;
var scene;
var camera;
var renderer;
var controls;
var sphere = [];
var N = 8;
var twoExist;
var spherelist = [];
var save = [];
var firstUserColor = 0;
var usercolor = 0;
var maincolor = 1; //黒が先攻
var turn;
var command = document.getElementById("command");
var now = document.getElementById("now");
var flag = 0;
var tmp;
var aiList = ["randkun", "zodiac", "human"];
var vsAI = 0;
var step = 8;
var canput_list = [];
var skip = 0;
var luckypoint = [[0, 0, 0], [0, 0, N-1], [0, N-1, 0], [N-1, 0, 0], [0, N-1, N-1], [N-1, 0, N-1], [N-1, N-1, 0], [N-1, N-1, N-1]];
var spin = 5;
var mainArray = [];
var c = 1.0; //UCB1



function windSize(){
  height = window.innerHeight;
  width = window.innerWidth;
}



function init(){

  windSize(); //Windowサイズ取得

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(100, width / height, 1, 1000);
  controls = new THREE.OrbitControls(camera);
  controls.autoRotate = true;
  renderer = createRenderer(width, height);

  var l = 0;
  for(var i = 0; i < N; i++){
    sphere[i] = [];
    for(var j = 0; j < N; j++){
      sphere[i][j] = [];
      for(var k = 0; k < N; k++){
        if((i == N/2-1 && j == N/2-1 && k == N/2-1) || (i == N/2-1 && j == N/2 && k == N/2-1) || (i == N/2-1 && j == N/2-1 && k == N/2) || (i == N/2-1 && j == N/2 && k == N/2)){
          sphere[i][j][k] = createSphere(rad, -1, i, j, k);
        }else if((i == N/2 && j == N/2-1 && k == N/2-1) || (i == N/2 && j == N/2 && k == N/2-1) || (i == N/2 && j == N/2-1 && k == N/2) || (i == N/2 && j == N/2 && k == N/2)){
          sphere[i][j][k] = createSphere(rad, 1, i, j, k);
        }
        else sphere[i][j][k] = createSphere(rad, 0, i, j, k);
        spherelist[l++] = sphere[i][j][k];
      }
    }
  }

  var light1 = createLight(0xFFFFFF, -1000, 2000, -1000);
  var light2 = createLight(0xFFFFFF, 1000, 2000, 1000);
  camera.position.x = 100;
  camera.position.y = 100;
  camera.position.z = 100;
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(light1);
  scene.add(light2);
  update();
}



function createRenderer(width, height){
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  renderer.setClearColor(0x2EFE2E, 1);
  document.body.appendChild(renderer.domElement);
  return renderer;
}



function createSphere(rad, color, x, y, z){

  //候補位置FF0040 (2)
  //何もないFACC2E (0)
  //白FFFFFF (-1)
  //黒000000 (1)

  var colorcord;
  if(color == 2) colorcord = 0xFF0040;
  else if(color == -1) colorcord = 0xFFFFFF;
  else if(color == 1) colorcord = 0x000000;
  else colorcord = 0xFACC2E;

  var geometry = new THREE.SphereGeometry(rad, 25, 25);
  var material = new THREE.MeshPhongMaterial({color: colorcord});
  var sphere = new THREE.Mesh(geometry, material);

  sphere.color = color;

  //座標設定
  sphere.mapx = x;
  sphere.mapy = y;
  sphere.mapz = z;

  sphere.position.set((-N/2)*10+x*10+5, (-N/2)*10+y*10+5, (-N/2)*10+z*10+5);
  scene.add(sphere);
  return sphere;
}



function createLight(color, x, y, z){
  var light = new THREE.DirectionalLight(color);
  light.position.set(x, y, z);
  return light;
}



function showtext(){
  var str;
  if(skip != "fin"){
    if(skip == 0){
      turn = (maincolor == -1) ? "White turn.\n" : "Black turn.\n";
    }else{
      if(skip == 1){ //ME->AI(skip)->ME
        turn = (maincolor == -1) ? vsAI + " turn SKIP! White turn.\n" : vsAI + " turn SKIP! Black turn.\n";
      }else{ //AI->ME(skip)->AI->ME
        turn = (maincolor == -1) ? "White turn SKIPED! White turn.\n" : "Black turn SKIPED! Black turn.\n";
      }
    }
    str = turn + "おける箇所: " + canput(0) + " 箇所";
  }else{
    var whitepoint = 0;
    var blackpoint = 0;
    for(var i = 0; i < N; i++){for(var j = 0; j < N; j++){for(var k = 0; k < N; k++){
      if(sphere[i][j][k].color == 1) blackpoint++;
      else if(sphere[i][j][k].color == -1) whitepoint++;
      if(blackpoint > whitepoint) str = "Black WIN!\n" + "Black: " + blackpoint + " White: " + whitepoint;
      else if(blackpoint < whitepoint) str = "White WIN!\n" + "Black: " + blackpoint + " White: " + whitepoint;
      else str = "DRAW!\n" + "Black: " + blackpoint + " White: " + whitepoint;
    }}}
  }
  now.textContent = str;
}



function wlh(str){
  return window.location.href.split("#")[1] == str;
}



function update(){
  controls.update();
  requestAnimationFrame(update);
  renderer.render(scene, camera);

  var projector = new THREE.Projector();

  //マウスのグローバル変数
  var mouse = { x: 0, y: 0};

  if(flag == 0){//先攻後攻決定
    if(wlh(undefined)){
      command.textContent = "Please first decide a color.";
    }else if(!wlh("black") && !wlh("white")){
      command.textContent = "No! Please first decide the color!";
    }else{
      if(wlh("white")){
        firstUserColor = -1;
        usercolor = "You are White. after."
      }else if(wlh("black")){
        firstUserColor = 1;
        usercolor = "You are Black. first."
      }
      flag = 1;
      command.textContent = usercolor + "Please input a battle AI.";
    }
  }else if(flag == 1){//対戦AI決定
    if(wlh("randkun")) vsAI = "randkun";
    else if(wlh("zodiac")) vsAI = "zodiac";
    else if(wlh("human")) vsAI = "human";
    if(vsAI != 0) for(var i = 0; i < aiList.length; i++){
      if(aiList[i] != vsAI){
        tmp = document.getElementById(aiList[i]);
        tmp.parentNode.removeChild(tmp);
      }
      flag = 2;
    }
  }else if(flag == 2){
    command.textContent = usercolor + " VS. " + vsAI;
    showtext();
    if(firstUserColor == -1) ai();
    flag = 3;
  }

  if(flag == 3){

    window.location.hash = step + "step";

    window.onmousemove = function(ev){ //マウスが移動された時
      if(ev.target == renderer.domElement){
        //マウス座標2D変換
        var rect = ev.target.getBoundingClientRect();
        mouse.x =  ev.clientX - rect.left;
        mouse.y =  ev.clientY - rect.top;

        //マウス座標3D変換width(横)やheight(縦)は画面サイズ
        mouse.x =  (mouse.x / width) * 2 - 1;
        mouse.y = -(mouse.y / height) * 2 + 1;

        var vector = new THREE.Vector3(mouse.x, mouse.y ,1); //マウスベクトル

        projector.unprojectVector(vector, camera); //vectorはスクリーン座標系なので,オブジェクトの座標系に変換

        var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize()); //始点,向きベクトルを渡してレイを作成

        // クリック判定
        var obj = ray.intersectObjects(spherelist);
        if(obj.length > 0){
          obj[0].object.material.color.setHex(0x0067C0);
          save.push(obj[0]);
        }else if(save.length > 0){
          for(var i = 0; i < save.length; i++){
            //候補位置FF0040 (2)
            //何もないFACC2E (0)
            //白FFFFFF (-1)
            //黒000000 (1)
            var objcolor;
            if(save[i].object.color == 0) objcolor = 0xFACC2E;
            else if(save[i].object.color == 2) objcolor = 0xFF0040;
            else if(save[i].object.color == 1) objcolor = 0x000000;
            else objcolor = 0xFFFFFF;
            save[i].object.material.color.setHex(objcolor);
          }
          save = [];
        }
      }

      //マウスが押された時
      window.onmousedown = function(e){
        if(e.target == renderer.domElement) {
          //クリックされたら加速度切り替え(停止か稼働か)
          if(controls.autoRotate){
            controls.autoRotate = false;
          }else controls.autoRotate = true;
          if(obj.length > 0){
            if(sphere[obj[0].object.mapx][obj[0].object.mapy][obj[0].object.mapz].color == 2){
              play(obj[0].object.mapx, obj[0].object.mapy, obj[0].object.mapz, 0);
            }
            if(controls.autoRotate){ //加速度保持
              controls.autoRotate = false;
            }else controls.autoRotate = true;
          }
        }
      };
    };
  }
}



function river(x, y, z, sphere_array){
  var color = maincolor;
  var colorcord = (color == -1) ? 0xFFFFFF : 0x000000 ;
  for(var i = -1; i < 2; i++){for(var j = -1; j < 2; j++){for(var k = -1; k < 2; k++){
    if((i != 0 || j != 0 || k != 0) && 0 <= x+i && 0 <= y+j && 0 <= z+k && x+i < N && y+j < N && z+k < N){
      var count = 0;
      var m = x+i;
      var n = y+j;
      var o = z+k;
      while(((sphere_array == 0 && sphere[m][n][o].color == color * -1) || (sphere_array != 0 && sphere_array[m][n][o]== color * -1)) && 0 <= m+i && 0 <= n+j && 0 <= o+k && m+i < N && n+j < N && o+k < N){
        count++;
        m+=i;
        n+=j;
        o+=k;
      }
      if(sphere_array == 0 && sphere[m][n][o].color == color && count > 0){
        for(var p = 0; p < count; p++){
          sphere[m+(p+1)*i*-1][n+(p+1)*j*-1][o+(p+1)*k*-1].color = color;
          sphere[m+(p+1)*i*-1][n+(p+1)*j*-1][o+(p+1)*k*-1].material.color.setHex(colorcord);
        }
      }else if(sphere_array != 0 && sphere_array[m][n][o] == color && count > 0){
        for(var p = 0; p < count; p++) sphere_array[m+(p+1)*i*-1][n+(p+1)*j*-1][o+(p+1)*k*-1] = color;
      }
    }
  }}}
  if(sphere_array == 0){
    sphere[x][y][z].color = color;
    sphere[x][y][z].material.color.setHex(colorcord);
    maincolor *= -1;
    step++;
  }else if(sphere_array != 0){
    sphere_array[x][y][z] = color;
    maincolor *= -1;
  }
}




function canput(sphere_array){
  //候補位置をリセット
  var color = maincolor;
  for(var i = 0; i < N; i++){for(var j = 0; j < N; j++){for(var k = 0; k < N; k++){
    if(sphere_array == 0 && sphere[i][j][k].color == 2){
      sphere[i][j][k].color = 0;
      sphere[i][j][k].material.color.setHex(0xFACC2E);
    }else if(sphere_array != 0 && sphere_array[i][j][k] == 2) sphere_array[i][j][k] = 0;
  }}}
  var twoExist = 0;
  canput_list = [];
  for(var i = 0; i < N; i++){for(var j = 0; j < N; j++){for(var k = 0; k < N; k++){
    if((sphere_array == 0 && sphere[i][j][k].color == 0) || (sphere_array != 0 && sphere_array[i][j][k] == 0)){
      for(var p = -1; p < 2; p++){for(var q = -1; q < 2; q++){for(var r = -1; r < 2; r++){
        if((p != 0 || q != 0 || r != 0) && 0 <= i+p && 0 <= j+q && 0 <= k+r && i+p < N && j+q < N && k+r < N){
          var count = 0;
          var m = i+p;
          var n = j+q;
          var o = k+r;
          while(((sphere_array == 0 && sphere[m][n][o].color == color * -1) || (sphere_array != 0 && sphere_array[m][n][o] == color * -1)) && 0 <= m+p && 0 <= n+q && 0 <= o+r && m+p < N && n+q < N && o+r < N){
            count++;
            m+=p;
            n+=q;
            o+=r;
          }
          if(sphere_array == 0 && sphere[m][n][o].color == color && count > 0){
            sphere[i][j][k].color = 2;
            sphere[i][j][k].material.color.setHex(0xFF0040);
            canput_list[twoExist++] = [i, j, k];
          }else if(sphere_array != 0 && sphere_array[m][n][o] == color && count > 0){
            sphere_array[i][j][k] = 2;
            canput_list[twoExist++] = [i, j, k];
          }
        }
      }}}
    }
  }}}
  return twoExist;
}



function play(x, y, z, sphere_array){
  river(x, y, z, sphere_array);
  if(canput(0) == 0){
    maincolor *= -1;
    skip++;
    if(canput(0) == 0){
      skip = "fin";
      showtext();
    }else{
      if(maincolor != firstUserColor){
        skip++;
        showtext();
        skip = 0;
        ai();
      }else{
        showtext();
        skip = 0;
      }
    }
  }else{
    skip = 0;
    if(firstUserColor != maincolor){
      ai();
    }else showtext();
  }
}



function randkun(sphere_array){
  var xyz = [];
  var l = 0;
  for(var i = 0; i < N; i++){for(var j = 0; j < N; j++){for(var k = 0; k < N; k++){
    if(sphere_array == 0 && sphere[i][j][k].color == 2) xyz[l++] = [i, j, k];
    if(sphere_array != 0 && sphere_array[i][j][k] == 2) xyz[l++] = [i, j, k];
  }}}
  return xyz[getRandomInt(0, xyz.length - 1)];
}



function epi(totalWin, times, total, xyz){
  var saveArray = [];
  mainArray = mainAR();
  Object.assign(saveArray, mainArray);
  var savecolor = JSON.parse(JSON.stringify(maincolor));
  var win = -3;
  river(xyz[0], xyz[1], xyz[2], saveArray);

  while(win == -3){
    if(canput(saveArray) == 0){
      maincolor *= -1;
      if(canput(saveArray) == 0){
        var whitepoint = 0;
        var blackpoint = 0;
        for(var i = 0; i < N; i++){for(var j = 0; j < N; j++){for(var k = 0; k < N; k++){
          if(saveArray[i][j][k] == 1) blackpoint++;
          else if(saveArray[i][j][k] == -1) whitepoint++;
        }}}
        if(blackpoint > whitepoint){
          win = (firstUserColor == -1) ? 1 : 0;
        }else if(blackpoint < whitepoint){
          win = (firstUserColor == 1) ? 1 : 0;
        }else win = 0;
      }
    }else{
      var xyzpoint = randkun(saveArray);
      river(xyzpoint[0], xyzpoint[1], xyzpoint[2], saveArray);
    }
  }
  maincolor = JSON.parse(JSON.stringify(savecolor));
  Object.assign(saveArray, mainArray);
  return [totalWin+win, times+1, xyz[0], xyz[1], xyz[2], ucb(totalWin+win, times+1, total)];
}



function maxhope(hopeArray){
  var max = [];
  max[0] = [];
  max[1] = 0;
  Object.assign(max[0], hopeArray[0]);
  for(var i = 1; i < hopeArray.length; i++){
    if(max[0][5] < hopeArray[i][5]){
      max[1] = i;
      Object.assign(max[0], hopeArray[i]);
    }
  }
  return max;
}



function best(){
  var saveArray = [];
  Object.assign(saveArray, mainArray);
  var canput_list_cp = JSON.parse(JSON.stringify(canput_list));
  var loop = (canput_list.length < spin) ? canput_list.length : spin;
  var hope = [];

  for(var i = 0; i < loop; i++){
    var max = canput_list_cp[getRandomInt(0, canput_list_cp.length - 1)];
    var unluckypoint = 0;
    var total = loop;

    //max部分を削る
    for(var j = 0; j < canput_list_cp.length; j++){
      if(canput_list_cp[j].indexOf(max[0]) > -1 && canput_list_cp[j].indexOf(max[1]) > -1 && canput_list_cp[j].indexOf(max[2])){
        canput_list_cp = canput_list_cp.slice(0, j).concat(canput_list_cp.slice(j+1, canput_list_cp.length));
        break;
      }
    }
    //角の周りは出来るだけ置かない
    for(var j = -1; j < 2 && unluckypoint == 0 ; j++){for(var k = -1; k < 2 && unluckypoint == 0; k++){for(var l = -1; l < 2 && unluckypoint == 0; l++){
      for(var m = 0; m < luckypoint.length && unluckypoint == 0; m++){
        if((j != 0 || k != 0 || l != 0) && max[0]+j == luckypoint[m][0] && max[1]+k == luckypoint[m][1] && max[2]+l == luckypoint[m][2]){
          if(sphere[luckypoint[m][0]][luckypoint[m][1]][luckypoint[m][2]].color == maincolor){//すでに角をとっているなら置いたほうが良い
            unluckypoint = -1;
            break;
          }
          if(unluckypoint == 0) unluckypoint = 1;//角を取っていないので最悪の一手と成りうる
        }
      }
    }}}

    hope[i] = [];
    //候補位置の選定
    if(unluckypoint != 1){

    var tmphope = [];
    mainArray = mainAR();
    Object.assign(saveArray, mainArray);

    var savecolor = JSON.parse(JSON.stringify(maincolor));

    hope[i] = epi(0, 0, total, max);

    savecolor = JSON.parse(JSON.stringify(maincolor));
    mainArray = mainAR();
    Object.assign(saveArray, mainArray);
    maincolor = JSON.parse(JSON.stringify(savecolor));

    }else hope[i] = [-10, 1, max[0], max[1], max[2], -10, total];
  }

  //hope[i] = [(勝利数), (この手でのプレイ回数), (x座標), (y座標), (z座標), (ucb1値)]

  for(var i = 0; i < loop*2; i++){

    var hopebest = maxhope(hope);

    mainArray = mainAR();
    Object.assign(saveArray, mainArray);
    savecolor = JSON.parse(JSON.stringify(maincolor));

    max = [hopebest[0][2], hopebest[0][3], hopebest[0][4]];
    hope[hopebest[1]] = epi(hopebest[0][0], hopebest[0][1], total++, max);

    mainArray = mainAR();
    Object.assign(saveArray, mainArray);
    maincolor = JSON.parse(JSON.stringify(maincolor));

    for(var j = 0; j < hope.length; j++){

      //モンテカルロ木の伸ばした枝まで更新
      hope[j][4] =  ucb(hope[j][0], hope[j][1], total+i+1);

    }
  
  }

  hopebest = maxhope(hope);

  for(var i = 0; i < hope.length; i++){
    alert(hope[i]);
  }

  alert(hopebest);
  //最適な手段を選択
  return [hopebest[0][2], hopebest[0][3], hopebest[0][4]];
}



function ucb(w, n, t){
  return (w / n) + c * Math.sqrt( ( 2 * Math.log(t) ) / n);
}



function zodiac(){
  var xyz = 0;

  //19局面までrandkun
  if(step < 20) xyz = randkun(0);

  //19局面以降
  else{
    //角に置けるなら置く
    for(var i = 0; i < luckypoint.length; i++){
      if(sphere[luckypoint[i][0]][luckypoint[i][1]][luckypoint[i][2]].color == 2){
        xyz = [luckypoint[i][0], luckypoint[i][1], luckypoint[i][2]];
        break;
      }
    }

    //モンテカルロ木
    if(xyz == 0){
      mainArray = mainAR();
      var savecolor = JSON.parse(JSON.stringify(maincolor));
      xyz = best();
      maincolor = JSON.parse(JSON.stringify(savecolor));
    }
  }
  return xyz;
}



function mainAR(){
  var mainArray = [];
  for(var i = 0; i < N; i++){
    mainArray[i] = [];
    for(var j = 0; j < N; j++){
      mainArray[i][j] = [];
      for(var k = 0; k < N; k++){
      mainArray[i][j][k] = sphere[i][j][k].color;
      }
    }
  }
  return mainArray;
}



function ai(){
  var xyz = [];
  if(vsAI == "randkun") xyz = randkun(0);
  else if(vsAI == "zodiac") xyz = zodiac();
  if(vsAI == "human") showtext();
  else play(xyz[0], xyz[1], xyz[2], 0);
}



function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



window.addEventListener('DOMContentLoaded', init);
