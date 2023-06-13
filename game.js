 
let can,x,y
window.onload=function(){
    can = document.getElementById("backgroundcanvas")
    resizeCanvas(can)
}

window.onresize=function(){
    resizeCanvas(can)
}

function resizeCanvas(canvas){
    canvas.width = window.innerWidth-(0.01*window.innerWidth);
    canvas.height = window.innerHeight-(0.01*window.innerHeight);
}

window.addEventListener('keydown',gamefunc)
let hold=0

function gamefunc(e){
    if(e.key==' '){
        if(hold%2==0){
          hold+=1
          pausegame()
          return
        }
        if(hold%2!==0){
          hold+=1
          playgame()
          return
        }
      } 

}

let mouseX,mouseY
let backcanvas 
backcanvas=document.getElementById("backgroundcanvas")
var ctx=backcanvas.getContext("2d")
x=window.innerWidth
y=window.innerHeight
let e
p=0.01*window.innerWidth
q=0.01*window.innerHeight

let pause = false

function detectcollision(x1,y1,x2,y2,r1,r2){
    return (Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1))) < (r1+r2)
}



class player{
    constructor(x,y,a,w,h,speed,boundx,boundy,topbx,topby,home,collision,health,enemies,damage,regen,lasertimer){
        this.x=x
        this.y=y
        this.radius=a
        this.speed=speed
        this.boundxe=boundx
        this.boundye=boundy
        this.topx=topbx
        this.topy=topby
        this.gunwidth=w
        this.gunheight=h
        this.health=health
        this.maxhealth=100
        this.home=home
        this.collision=collision
        this.enemies=enemies
        this.damage=damage
        this.maxregen=100
        this.regen=regen
        this.selfhealmeter=0
        this.gun1= new gun(this,this.x,this.y,this.gunwidth,this.gunheight,this.angle,this.shootpressed,20,this.healthpressed,this.home)
        this.laser=false
        this.lasertimer=lasertimer
        this.laserr=lasertimer
        this.healable=20

        window.addEventListener("keydown",this.keydown);
        window.addEventListener("keyup",this.keyup);
        window.addEventListener("mousemove",this.getmousecoord.bind(this))
        window.addEventListener("mousedown",this.mousedown)
        window.addEventListener("mouseup",this.mouseup)
    }

    draw(ctx){
        
        this.movement()
        this.playerimg=document.createElement('img')
        this.playerimg.src='files/player.png'
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI)
        ctx.drawImage(this.playerimg, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
        ctx.closePath()
        ctx.restore()
        this.gun1.draw()
        this.healthbar()

        if(this.health>this.maxhealth){
            this.health=this.maxhealth
        }
        if(this.regen>this.maxregen){
            this.regen=this.maxregen
        }
        if(this.selfheal){
            if(this.regen>10){
                this.selfhealmeter+=1
                this.healnow=true
            }
            else{
                this.maxselfhealmeter=(this.regen/10)*150
                this.selfhealmeter+=1
                if(this.selfhealmeter>this.maxselfhealmeter){
                    this.selfhealmeter=this.maxselfhealmeter
                    this.healnow=true
                }
            }
        }
        if(!(this.selfheal)){
            if(this.healnow){
                if(this.selfhealmeter>150){
                    this.health+=this.healable
                    this.regen-=10
                }
                else{   
                    this.health+=(this.selfhealmeter/150)*this.healable
                    this.regen-=(this.selfhealmeter/150)*10
                }
                
            }
            this.healnow=false
            this.selfhealmeter=0
        }
        if(this.selfheal){
            ctx.beginPath()
            ctx.arc(this.x,this.y,this.radius+10,0,((this.selfhealmeter)/150)*Math.PI*2)
            ctx.strokeStyle='blue'
            ctx.lineWidth=10
            ctx.stroke()
        }
        if(this.laser){
            
            this.lasertimer-=1
            if(this.lasertimer>0){
                this.laseraction()
            }
            if(this.lasertimer<0){
                this.lasertimer=this.laserr
                this.laser=false
            }
            
        }
    }

    keydown=(e)=>{
        if(e.code === "KeyW"){
            this.up = true;
        }
        if(e.code === "KeyS"){
            this.down = true;
        }
        if(e.code === "KeyA"){
            this.left = true;
        }
        if(e.code === "KeyD"){
            this.right = true;
        }
        if(e.code === "KeyR"){
            this.selfheal=true;
        }
    }

    keyup=(e)=>{
        if(e.code === "KeyW"){
            this.up = false;
        }
        if(e.code === "KeyS"){
            this.down = false;
        }
        if(e.code === "KeyA"){
            this.left = false;
        }
        if(e.code === "KeyD"){
            this.right = false;
        }
        if(e.code === "KeyR"){
            this.selfheal=false;
        }
    }

    mousedown=(e)=>{
        if(e.button===0){
            this.shootpressed=true;
        }
        if(e.button===2){
            this.healthpressed=true;
        }
    }

    mouseup=(e)=>{
        if(e.button===0){
            this.shootpressed=false;
        }
        if(e.button===2){
            this.healthpressed=false;
        }
    }

    movement(){
        if (this.up){
            if(this.y-this.radius-this.speed>this.topy && !(this.collision(this.x,this.y-=this.speed,this.radius,this.home.x,this.home.y,this.home.radius))){
                this.y -= this.speed;
            }
        }
        if (this.down){
            if(this.y+this.radius+this.speed<this.boundye && !(this.collision(this.x,this.y+this.speed,this.radius,this.home.x,this.home.y,this.home.radius))){
                this.y += this.speed;
            }
        }
        if (this.left){
            if(this.x-this.radius-this.speed>this.topx && !(this.collision(this.x-this.speed,this.y,this.radius,this.home.x,this.home.y,this.home.radius))){
                this.x -= this.speed;
            }
        }
        if (this.right){
            if(this.x+this.radius+this.speed<this.boundxe && !(this.collision(this.x+this.speed,this.y,this.radius,this.home.x,this.home.y,this.home.radius))){
                this.x += this.speed;
            }
        }
       
    }

    getmousecoord(e){
        this.mousex=e.clientX
        this.mousey=e.clientY
        this.angle=this.angleupdate(this.mousey,this.y,this.mousex,this.x)-(0.5*Math.PI)
    }

    angleupdate(y2,y1,x2,x1){
        return Math.atan2(y2-y1,x2-x1)
    }

    healthbar(){
        ctx.fillStyle='green'
        ctx.fillRect(window.innerWidth/50,this.home.y+this.home.radius,(this.health/this.maxhealth)*(this.radius*3),this.radius*0.5)
        ctx.strokeStyle='white'
        ctx.strokeRect(window.innerWidth/50,this.home.y+this.home.radius,(this.radius*3),this.radius*0.5)
        this.diff=( window.innerHeight-window.innerWidth/100-this.home.y+this.home.radius/2) /3
        ctx.fillStyle='Blue'
        ctx.fillRect(window.innerWidth/50+this.diff*3.5,this.home.y+this.home.radius,this.regen*0.01*(this.radius*3),this.radius*0.5)
        ctx.strokeStyle='white'
        ctx.strokeRect(window.innerWidth/50+this.diff*3.5,this.home.y+this.home.radius,(this.radius*3),this.radius*0.5)
    }
    
    laseraction(){
        ctx.beginPath()
        ctx.moveTo(this.x+(Math.cos(this.lasertimer/50*Math.PI*2))*this.radius,this.y+(Math.sin(this.lasertimer/50*Math.PI*2))*this.radius)
        ctx.lineTo(this.x+(Math.cos(this.lasertimer/50*Math.PI*2))*(this.radius*10),this.y+(Math.sin(this.lasertimer/50*Math.PI*2))*(this.radius*10))
        ctx.lineWidth=this.gunwidth/3
        ctx.strokeStyle='gray'
        ctx.stroke()

        for(let i=0;i<this.enemies.length;i++){
            if(typeof(this.enemies[i].length)=='number'){
                for(let j=0;j<this.enemies[i].length;j++){
                    for(let k=8;k<80;k++){
                        if(this.collision(this.enemies[i][j].x,this.enemies[i][j].y,this.enemies[i][j].radius,this.x+(Math.cos(this.lasertimer/50*Math.PI*2))*(this.radius*10)*k/80,this.y+(Math.sin(this.lasertimer/50*Math.PI*2))*(this.radius*10)*k/80,0))
                        this.enemies[i][j].health-=10
                    }
                }
            }
        }
    }

}


class gun{

    constructor(player,x,y,w,h,angle,shootpress,delay,healthpress,home){
        this.player=player
        this.x=x
        this.y=y
        this.width=w
        this.height=h
        this.rotateang=angle
        this.shootpressed=shootpress
        this.bullets=[]
        this.firsttime=0
        this.delay=delay
        this.healthpress=healthpress
        this.healthmeter=0
        this.healthbullets=[]
        this.home=home
        this.maxearth=100

    }

    draw(){
    
        this.update()
        this.healthfire()
        
        if(this.shootpressed){
            this.fire()
        }
        
        this.bullets.forEach((bullet)=>{

            if(this.offscreen(bullet)){
                const index = this.bullets.indexOf(bullet)
                this.bullets.splice(index,1)
            }
            bullet.draw()
         })

        this.bullets.forEach((bullet)=>{
            if(typeof(this.player.enemies[0].length)=='number'){
                for(let i=0; i <this.player.enemies[0].length;i++){
                    if(this.player.collision(bullet.x,bullet.y,bullet.radius,this.player.enemies[0][i].x,this.player.enemies[0][i].y,this.player.enemies[0][i].radius)){
                        const index = this.bullets.indexOf(bullet)
                        this.bullets.splice(index,1)
                        this.player.regen+=this.player.damage/12
                        this.player.enemies[0][i].health-=this.player.damage
                       
                    }
                }
            }
            if(typeof(this.player.enemies[1].length)=='number'){
                for(let i=0; i <this.player.enemies[1].length;i++){
                    if(this.player.collision(bullet.x,bullet.y,bullet.radius,this.player.enemies[1][i].x,this.player.enemies[1][i].y,this.player.enemies[1][i].radius)){
                        const index = this.bullets.indexOf(bullet)
                        this.bullets.splice(index,1)
                        this.player.regen+=this.player.damage/8
                        this.player.enemies[1][i].health-=this.player.damage*1.5
                       
                    }
                }
            }
            if(typeof(this.player.enemies[2].length)=='number'){
                for(let i=0; i <this.player.enemies[2].length;i++){
                    if(this.player.collision(bullet.x,bullet.y,bullet.radius,this.player.enemies[2][i].x,this.player.enemies[2][i].y,this.player.enemies[2][i].radius)){
                        const index = this.bullets.indexOf(bullet)
                        this.bullets.splice(index,1)
                        this.player.regen+=this.player.damage/6
                        this.player.enemies[2][i].health-=this.player.damage*2
                       
                    }
                }
            }
            if(typeof(this.player.enemies[3].length)=='number'){
                for(let i=0; i <this.player.enemies[3].length;i++){
                    if(this.player.collision(bullet.x,bullet.y,bullet.radius,this.player.enemies[3][i].x,this.player.enemies[3][i].y,this.player.enemies[3][i].radius)){
                        const index = this.bullets.indexOf(bullet)
                        this.bullets.splice(index,1)
                        this.player.regen+=this.player.damage/16
                        this.player.enemies[3][i].health-=this.player.damage*(3/4)
                       
                    }
                }
            }
        })

        this.healthbullets.forEach((pellet)=>{
            if(this.offscreen(pellet)){
                const index=this.healthbullets.indexOf(pellet)
                this.healthbullets.splice(index,1)
            }
            pellet.draw()

            if(this.player.collision(pellet.x,pellet.y,pellet.radius,this.home.x,this.home.y,this.home.radius)){

                const index=this.healthbullets.indexOf(pellet)
                this.healthbullets.splice(index,1)
                this.home.health=this.home.health+pellet.healed

            }
        })

        this.rotate()

        if(this.healthpress){
            ctx.beginPath()
            ctx.arc(this.x,this.y,this.player.radius+10,0,((this.healthmeter)/150)*Math.PI*2)
            ctx.strokeStyle='green'
            ctx.lineWidth=10
            ctx.stroke()
        }
        
    }

    update(){
        this.x=this.player.x
        this.y=this.player.y
        this.rotateang=this.player.angle
        this.shootpressed=this.player.shootpressed
        this.healthpress= this.player.healthpressed
    }

    rotate(){
        this.gunimg=document.createElement('img')
        this.gunimg.src='files/gun.png'
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        ctx.rotate(this.rotateang);
        ctx.drawImage(this.gunimg, -(this.width / 2), 0, this.width, this.height);
        ctx.restore();

    }

    fire(){
        let speed=20
        if(this.firsttime==0){
            this.bullets.push(new bullet(this.x,this.y,speed,this.width,this.rotateang,this.player))
            this.firsttime=1
            this.timetill=this.delay
        }
        if(this.timetill<=0){
            this.bullets.push(new bullet(this.x,this.y,speed,this.width,this.rotateang,this.player))
            this.timetill=this.delay
        }
            this.timetill-=1
    }

    offscreen(bullet){
        return (bullet.x+(bullet.radius)>this.player.boundxe || bullet.y+(bullet.radius)>this.player.boundye || bullet.x-(bullet.radius)<this.player.topx || bullet.y-(bullet.radius)<this.player.topy)
    }

    healthfire(){
        let speed=window.innerWidth/1000
        if(this.healthpress){
            if(this.player.regen>10){
                this.healthmeter+=1
                this.bulletadd=true
            }
            else{
                this.maxhealmeter=(this.player.regen/10)*150
                this.healthmeter+=1
                if(this.healthmeter>this.maxhealmeter){
                    this.healthmeter=this.maxhealmeter
                    this.bulletadd=true
                }
            }
        }
    
        if(!(this.healthpress)){
            if(this.bulletadd){
            
                this.healthbullets.push(new health_pellet(this.x,this.y,speed,this.width,this.rotateang,this.player,this.healthmeter,this.maxearth))
            }
            if(this.healthmeter>150){
                this.player.regen-=10
            }
            else{
                this.player.regen-=(this.healthmeter/150 ) *10
            }
            this.bulletadd=false
            this.healthmeter=0
        }
    }
}

class health_pellet{
    constructor(x,y,speed,gunwidth,angle,player,healing,maxheal){
        this.x=x
        this.y=y
        this.radius=gunwidth/2
        this.speed=speed
        this.angletravel=angle
        this.player=player
        this.healing=healing
        this.maxheal=maxheal
    }
    draw(){
        ctx.beginPath()
        ctx.arc(this.x+((this.player.radius)*Math.sin(-this.angletravel)),this.y+((this.player.radius)*Math.cos(this.angletravel)),this.radius,0,2*Math.PI)
        this.x+=this.speed*Math.sin(-this.angletravel)
        this.y+=this.speed*Math.cos(-this.angletravel)
        ctx.fillStyle='green'
        ctx.fill()
        if(this.healing>150){
            this.healed=this.maxheal
        }
        else{
             this.healed=(this.healing/150)*this.maxheal
        }
    } 
}

class bullet{
    constructor(x,y,speed,gunwidth,angle,player){
        this.x=x
        this.y=y
        this.radius=gunwidth/3
        this.speed=speed
        this.angletravel=angle
        this.player=player
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x+((this.player.radius)*Math.sin(-this.angletravel)),this.y+((this.player.radius)*Math.cos(this.angletravel)),this.radius,0,2*Math.PI)
        this.x+=this.speed*Math.sin(-this.angletravel)
        this.y+=this.speed*Math.cos(-this.angletravel)
        ctx.fillStyle='white'
        ctx.fill()
    }
}

class home{
    constructor(x,y,health,radius){
        this.x=x
        this.y=y
        this.max=health
        this.health=health
        this.radius=radius
        
    }

    draw(){
        this.image=document.createElement('img')
        this.image.src='files/playerbase.png'
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI)
        ctx.clip()
        
        ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
        ctx.closePath()
        ctx.restore()
        this.healthbar()

        if(this.health>this.max){
            this.health=this.max
        }
    }

    healthbar(){
        ctx.strokeStyle="white"
        ctx.lineWidth=window.innerHeight/1000
        ctx.strokeRect(this.x-this.radius-2*window.innerWidth/100,this.y+this.radius,4*window.innerWidth/100+2*this.radius,(4*window.innerWidth/100+2*this.radius-+(window.innerHeight/1000))/7)
        ctx.fillStyle="green"
        if(this.health>this.max){
            ctx.fillRect(this.x-this.radius-2*window.innerWidth/100+(window.innerHeight/1000),this.y+this.radius,(4*window.innerWidth/100+2*this.radius-+(window.innerHeight/1000)),(4*window.innerWidth/100+2*this.radius-+(window.innerHeight/1000))/7)
        }
        else{
            ctx.fillRect(this.x-this.radius-2*window.innerWidth/100+(window.innerHeight/1000),this.y+this.radius,(this.health/this.max)*(4*window.innerWidth/100+2*this.radius-(window.innerHeight/1000)),(4*window.innerWidth/100+2*this.radius-(window.innerHeight/1000))/7)
         }
         ctx.strokeStyle='white'
         ctx.strokeRect(this.x-this.radius-2*window.innerWidth/100+(window.innerHeight/1000),this.y+this.radius,(this.health/this.max)*(4*window.innerWidth/100+2*this.radius-(window.innerHeight/1000)),(4*window.innerWidth/100+2*this.radius-(window.innerHeight/1000))/7)
    }
}

class base_enemy{
    constructor(x,y,speed,radius,housing,delay,arr,img,player,collision,health,damage){
        this.inix=x
        this.iniy=y
        this.x=Math.random()*(window.innerWidth)
        this.y=Math.random()*(-radius-(-radius*4))+(-radius*4)
        this.speed=speed
        this.radius=radius
        this.home=housing
        this.count=0
        this.delay=delay
        this.attack=arr
        this.enembullets=[]
        this.dist=[[0,0,0],[0,0,0]]
        this.img=img
        this.player=player
        this.collision=collision
        this.health=health
        this.temp=speed
        this.damage=damage
        this.max=health
    }

    draw(){
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI)
        ctx.clip
        
        ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
        ctx.closePath()
        ctx.restore()
        
        if(this.count==0){
            this.targetx=this.inix
            this.targety=this.iniy
            this.count=1
            this.waittime=this.delay
        }
       
       this.movement()

       if(this.waittime%200 === 0 ){
            this.shoot()
       }

        this.enembullets.forEach((enemybullet)=>{
        if(this.offscreen(enemybullet) ){
            const index=this.enembullets.indexOf(enemybullet)
            this.enembullets.splice(index,1)
        }
        this.enembullets.forEach((enemybullet)=>{
            if(this.collision(enemybullet.x,enemybullet.y,enemybullet.radius,this.player.x,this.player.y,this.player.radius)){
                const index=this.enembullets.indexOf(enemybullet)
                this.enembullets.splice(index,1)
                this.player.health-=this.damage
            }
        })
        this.enembullets.forEach((enemybullet)=>{
            if(this.collision(enemybullet.x,enemybullet.y,enemybullet.radius,this.home.x,this.home.y,this.home.radius)){
                const index=this.enembullets.indexOf(enemybullet)
                this.enembullets.splice(index,1)
                this.home.health-=this.damage
                
            }
        })
        enemybullet.draw()
       })
       
       if(this.attack.length==1){
        this.class=1
       }
       else{
        this.class=2
       }
       this.healthbar()
    }

    targetlocation(){
        let xw=window.innerWidth
        let yh=window.innerHeight
        this.targetx=(3*xw)/100 + (Math.random() * ((94*xw)/100))
        this.targety=(3*xw)/100 + (Math.random() * ((yh/1.2)-(x/10)))
    }
    movement(){
        this.angletravel=Math.atan2(this.targety-this.y,this.targetx-this.x) 
        this.x+=this.speed*(Math.cos(this.angletravel))
        this.y+=this.speed*(Math.sin(this.angletravel))
        if(this.targetx-this.x < 1.5 && this.targety-this.y < 1.5){    
            this.targetx=this.x
            this.targety=this.y
            this.speed=0
            this.waittime-=1
            if(this.waittime==0){
                this.targetlocation()
                this.speed=this.temp
                this.waittime=this.delay
            }   
         }
    }

    target(){
        for(let i=0;i<this.attack.length;i++){
            this.dist[i][0]=Math.pow((this.attack[i].x-this.x),2)+Math.pow((this.attack[i].y-this.y),2)
            this.dist[i][1]=this.attack[i].x
            this.dist[i][2]=this.attack[i].y
        }
        this.dist.sort((a,b)=>a[0]-b[0])
        if(this.dist[0][0]==0){
            this.hitx=this.dist[1][1]
            this.hity=this.dist[1][2]
        }
        else{
            this.hitx=this.dist[0][1]
            this.hity=this.dist[0][2]
        }
        this.targetangle=Math.atan2(this.hity-this.y,this.hitx-this.x)
    }

    shoot(){
        this.target()
        this.enembullets.push(new enemy_bullet(this.x,this.y,window.innerWidth/373,this.radius/5,this.targetangle,this))
        
    }

    offscreen(bullet){
        return (bullet.x+(bullet.radius)>this.player.boundxe || bullet.y+(bullet.radius)>this.player.boundye || bullet.x-(bullet.radius)<this.player.topx || bullet.y-(bullet.radius)<this.player.topy)
    }
    healthbar(){
        ctx.strokeRect(this.x-this.radius,this.y+this.radius,2*this.radius,0.2*this.radius)
        ctx.fillStyle='red'
        
        ctx.fillRect(this.x-this.radius,this.y+this.radius,(this.health/this.max)*(2*this.radius),0.2*this.radius)
    }

   
}

class enemy_bullet{
    constructor(x,y,speed,radius,angle,enemy){
        this.x=x
        this.y=y
        this.radius=radius
        this.angle=angle
        this.speed=speed

        this.dist={}
        this.enemy=enemy
    }
    draw(){
        ctx.beginPath()
        ctx.arc(this.x+((this.enemy.radius)*Math.cos(this.angle)),this.y+((this.enemy.radius)*Math.sin(this.angle)),this.radius,0,2*Math.PI)
        this.x+=this.speed*Math.cos(this.angle)
        this.y+=this.speed*Math.sin(this.angle)
        ctx.fillStyle='red'
        ctx.fill()
    
    }

    
}

class homing_melee{
    constructor(x,y,home,angle,radius,damage,){
        this.inix=x
        this.iniy=y
        this.x=Math.random()*(window.innerWidth)
        this.y=Math.random()*(-radius-(-radius*4))+(-radius*4)
        this.home=home
        this.angle=angle
        this.radius=radius
        this.c=1
        this.speed=window.innerWidth/3730
        this.health=100
        this.class=3
        this.damage=damage
        this.max=100
        
    }
    draw(){
        this.img=document.createElement('img')
        this.img.src="files/melee.png"
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI)
        ctx.clip
        
        ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
        ctx.closePath()
        ctx.restore()
        if(this.c==1){
            this.targetx=this.x
            this.targety=this.y
            this.c=0
        }
        if(this.c==0){
            this.target()
            this.c=2
        }
        this.movement()
        this.healthbar()

    }

    target(){
        this.targetx=this.home.x+this.home.radius*(Math.cos(this.angle))
        this.targety=this.home.y+this.home.radius*(Math.sin(this.angle))
    }

    movement(){
        
            this.angletravel=Math.atan2(this.targety-this.y,this.targetx-this.x) 
            this.x+=this.speed*(Math.cos(this.angletravel))
            this.y+=this.speed*(Math.sin(this.angletravel))
            if(this.targetx-this.x<0.5 && this.targety-this.y<0.5){
                this.targetx=this.x
                this.targety=this.y
                this.speed=0
                this.home.health-=this.damage
            }
    }
    healthbar(){
        ctx.strokeRect(this.x-this.radius,this.y+this.radius,2*this.radius,0.2*this.radius)
        ctx.fillStyle='red'
        
        ctx.fillRect(this.x-this.radius,this.y+this.radius,(this.health/this.max)*(2*this.radius),0.2*this.radius)
    }
}

class boss{
    constructor(x,y,radius,home,player,delay,speed,collision,health,bbd,epd){
        this.x=window.innerWidth/2
        this.y=-radius*2
        this.inix=x
        this.iniy=y
        this.radius=radius  
        this.home=home
        this.player=player
        this.delay=delay
        this.speed=speed
        this.temp=speed
        this.bigammo=[]
        this.bosspellets=[]
        this.collision=collision
        this.array=[this.player,this.home]
        this.counter=1
        this.health=health
        this.bossbulletdamage=bbd 
        this.eachpelletdmg=epd
        this.maxhealthboss=health
    }

    draw(){
       
        this.bossimg=document.createElement('img')
        this.bossimg.src='files/enemyboss.png'
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI)
        ctx.clip
        ctx.drawImage(this.bossimg,this.x-this.radius,this.y-this.radius,this.radius*2,this.radius*2)
        ctx.closePath()
        ctx.restore()
        if(this.counter==1){
            this.counter=0
            this.targetx=this.inix
            this.targety=this.iniy
            this.waittime=this.delay
        }
        this.movement()
        if(this.waittime%900==0){

            this.shoot()
        }
        if(this.waittime===2000 || this.waittime===1000){
            this.spray()
        }
        this.drawbullet()
        this.drawpellet()
        this.takedamge()
        this.healthbar()
        
    }

    targetlocation(){
        let xw=window.innerWidth
        let yh=window.innerHeight
        this.targetx=(5*xw)/100 + (Math.random() * ((90*xw)/100))
        this.targety=(5*xw)/100 +(Math.random() * ((yh/2)-((9*x)/100)))
    }

    movement(){
        this.angletravel=Math.atan2(this.targety-this.y,this.targetx-this.x)
       
        this.x+=this.speed*(Math.cos(this.angletravel))
      
        this.y+=this.speed*(Math.sin(this.angletravel))
        if(this.targetx-this.x < 1.5 && this.targety-this.y < 1.5){    
            this.targetx=this.x
            this.targety=this.y
            this.speed=0
            this.waittime-=1
            if(this.waittime==0){
                this.targetlocation()
                this.speed=this.temp
                this.waittime=this.delay
            }   
         }

    }
    
    shoot(){
        this.targetangle=Math.atan2(this.home.y-this.y,this.home.x-this.x)
        this.bigammo.push(new bossbullet(this.x,this.y,window.innerWidth/746,this.radius/4,this.targetangle,this,this.bossbulletdamage))
        
    }
    drawbullet(){
        this.bigammo.forEach((bossybullet)=>{
            if(this.offscreen(bossybullet)){
                const index=this.bigammo.indexOf(bossybullet)
                this.bigammo.splice(index,1)
            }
            for(let i=0;i<2;i++){
                if(this.collision(this.array[i].x,this.array[i].y,this.array[i].radius,bossybullet.x,bossybullet.y,bossybullet.radius)){
                    const index=this.bosspellets.indexOf(bossybullet)
                    this.bigammo.splice(index,1)
                    this.array[i].health-=bossybullet.damage
                }
            }
            bossybullet.draw()
        })
    }
    
    spray(){
        for(let i=0;i<50;i++){
            this.bosspellets.push(new bosspellet(this.x,this.y,window.innerWidth/497,this.radius/10,((i+1)/50)*Math.PI*2,this,this.eachpelletdmg))
        }
    }

    drawpellet(){
        this.bosspellets.forEach((bossypellet)=>{
            if(this.offscreen(bossypellet)){
                const index=this.bosspellets.indexOf(bossypellet)
                this.bosspellets.splice(index,1)
            }
            for(let i=0;i<2;i++){
                if(this.collision(this.array[i].x,this.array[0].y,this.array[0].radius,bossypellet.x,bossypellet.y,bossypellet.radius)){
                    const index=this.bosspellets.indexOf(bossypellet)
                    this.bosspellets.splice(index,1)
                    this.array[i].health-=bossypellet.damage
                }
            }
            bossypellet.draw()

        })
    }
    offscreen(bullet){
        return (bullet.x+(bullet.radius)>this.player.boundxe || bullet.y+(bullet.radius)>this.player.boundye || bullet.x-(bullet.radius)<this.player.topx || bullet.y-(bullet.radius)<this.player.topy)
    }

    takedamge(){
       
        this.player.gun1.bullets.forEach((playerbullet)=>{
            if (this.collision(playerbullet.x,playerbullet.y,playerbullet.radius,this.x,this.y,this.radius)){
                const index=this.player.gun1.bullets.indexOf(playerbullet)
                this.player.gun1.bullets.splice(index,1)
                this.health-=this.player.damage/1.2
                this.player.regen+=this.player.damage/14.4
            }
        })

        if(this.player.laser){
            for(let k=8;k<80;k++){
                if(this.collision(this.x,this.y,this.radius,this.player.x+(Math.cos(this.player.lasertimer/50*Math.PI*2))*(this.player.radius*10)*k/80,this.player.y+(Math.sin(this.player.lasertimer/50*Math.PI*2))*(this.player.radius*10)*k/80,0)){
                    this.health-=0.3
                }
                
            }
        }
    }
    
    healthbar(){
        ctx.strokeRect(this.x-this.radius,this.y+this.radius,2*this.radius,0.2*this.radius)
        ctx.fillStyle='red'
        
        ctx.fillRect(this.x-this.radius,this.y+this.radius,(this.health/this.maxhealthboss)*(2*this.radius),0.2*this.radius)
       
    }
}

class bossbullet{
    constructor(x,y,speed,radius,angle,boss,damage){
        this.x=x
        this.y=y
        this.speed=speed
        this.radius=radius  
        this.angle=angle
        this.boss=boss
        this.damage=damage
    }
    draw(){
        this.x+=this.speed*Math.cos(this.angle)
        this.y+=this.speed*Math.sin(this.angle)
        this.bossbully=document.createElement('img')
        this.bossbully.src='files/bossbullet.png'
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.x+((this.boss.radius)*Math.cos(this.angle)),this.y+((this.boss.radius)*Math.sin(this.angle)),this.radius,0,2*Math.PI)
        ctx.drawImage(this.bossbully,this.x-this.radius,this.y-this.radius,this.radius*2,this.radius*2)
        ctx.closePath()
        ctx.restore()
    }
    
}

class bosspellet{
    constructor(x,y,speed,radius,angle,boss,damage){
        this.x=x
        this.y=y
        this.speed=speed
        this.radius=radius  
        this.angle=angle
        this.boss=boss
        this.damage=damage
    }
    draw(){
        this.x+=this.speed*Math.cos(this.angle)
        this.y+=this.speed*Math.sin(this.angle)
        this.bossbully=document.createElement('img')
        this.bossbully.src='files/bosspellet.png'
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.x+((this.boss.radius)*Math.cos(this.angle)),this.y+((this.boss.radius)*Math.sin(this.angle)),this.radius,0,2*Math.PI)
        ctx.drawImage(this.bossbully,this.x-this.radius,this.y-this.radius,this.radius*2,this.radius*2)
        ctx.closePath()
        ctx.restore()
    }
}

class homing_enemy{
    constructor(x,y,speed,radius,delay,damage,player,home,collision,health){
        this.inix=x
        this.iniy=y
        this.x=Math.random()*(window.innerWidth)
        this.y=Math.random()*(-radius-(-radius*4))+(-radius*4)
        this.speed=speed
        this.radius=radius
        this.damage=damage
        this.delay=delay
        this.count=0
        this.homebullets=[]
        this.player=player
        this.home=home
        this.collision=collision
        this.temp=speed
        this.health=health
        this.class=4
        this.max=health
    }
    draw(){
        this.homoenemy=document.createElement('img')
        this.homoenemy.src='files/homeenemy.png'
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI)
        ctx.clip
        
        ctx.drawImage(this.homoenemy, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
        ctx.closePath()
        ctx.restore()   
        if(this.count==0){
            this.targetx=this.inix
            this.targety=this.iniy
            this.count=1
            this.waittime=this.delay
        }
        this.movement()
        this.shoot()
        this.homebullets.forEach((bullety)=>{
            if(this.offscreen(bullety)){
                const index=this.homebullets.indexOf(bullety)
                this.homebullets.splice(index,1)
            }
            if(this.collision(bullety.x,bullety.y,bullety.radius,this.player.x,this.player.y,this.player.radius)){
                const index=this.homebullets.indexOf(bullety)
                this.homebullets.splice(index,1)
                this.player.health-=this.damage
            }
            if(this.collision(bullety.x,bullety.y,bullety.radius,this.home.x,this.home.y,this.home.radius)){
                const index=this.homebullets.indexOf(bullety)
                this.homebullets.splice(index,1)
                this.home.health-=this.damage
            }
            bullety.draw()
        })
        this.healthbar()
    }

    targetlocation(){
        let xw=window.innerWidth
        let yh=window.innerHeight
        this.targetx=(3*xw)/100 + (Math.random() * ((94*xw)/100))
        this.targety=(3*xw)/100 + (Math.random() * ((yh/1.2)-(x/10)))
    }
    movement(){
        this.angletravel=Math.atan2(this.targety-this.y,this.targetx-this.x) 
        this.x+=this.speed*(Math.cos(this.angletravel))
        this.y+=this.speed*(Math.sin(this.angletravel))
        if(this.targetx-this.x < 1.5 && this.targety-this.y < 1.5){    
            this.targetx=this.x
            this.targety=this.y
            this.speed=0
            this.waittime-=1
            if(this.waittime==0){
                this.targetlocation()
                this.speed=this.temp
                this.waittime=this.delay
            }   
         }
    }
    shoot(){
        if(this.homebullets.length==0){
            this.homebullets.push( new homebullet(this.x,this.y,this.radius/5,window.innerWidth/1065,this.player,this.home,this))
        }
    }
    offscreen(bullet){
        return (bullet.x+(bullet.radius)>this.player.boundxe || bullet.y+(bullet.radius)>this.player.boundye || bullet.x-(bullet.radius)<this.player.topx || bullet.y-(bullet.radius)<this.player.topy)
    }
    healthbar(){
        ctx.strokeRect(this.x-this.radius,this.y+this.radius,2*this.radius,0.2*this.radius)
        ctx.fillStyle='red'
        
        ctx.fillRect(this.x-this.radius,this.y+this.radius,(this.health/this.max)*(2*this.radius),0.2*this.radius)
    }
}

class homebullet{
    constructor(x,y,radius,speed,player,home,enemy){
        this.x=x
        this.y=y
        this.radius=radius
        this.speed=speed
        this.player=player
        this.home=home
        this.enemy=enemy
    }
    draw(){
        this.getangle()
        this.x+=this.speed*Math.cos(this.angle)
        this.y+=this.speed*Math.sin(this.angle)
        this.hombullet=document.createElement('img')
        this.hombullet.src='files/homingbullet.png'
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.x+((this.enemy.radius)*Math.cos(this.angle)),this.y+((this.enemy.radius)*Math.sin(this.angle)),this.radius,0,2*Math.PI)
        ctx.drawImage(this.hombullet,this.x-this.radius,this.y-this.radius,this.radius*2,this.radius*2)
        ctx.closePath()
        ctx.restore()
    }
    getangle(){
        this.angle=Math.atan2(this.player.y-this.y,this.player.x-this.x)
    }

}

let laserimg=document.createElement('img')
let selfimg=document.createElement('img')
let earthhealimg=document.createElement('img')
laserimg.src='files/laser.png'
selfimg.src='files/selfheal.png'
earthhealimg.src='files/baseheal.png'


class spawnables{
    constructor(x,y,type,radius,player,collision,img,home){
        this.x=x
        this.y=y
        this.type=type
        this.radius=radius
        this.player=player
        this.collision=collision
        this.img=img
        this.eaten=false
        this.home=home
    }
    draw(){
        switch(this.type){
            case 1:
                ctx.save()
                ctx.beginPath()
                ctx.arc(this.x,this.y,this.radius,0,2*Math.PI)
                ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius,   this.radius * 2, this.radius * 2)
                ctx.closePath()
                if(this.collision(this.player.x,this.player.y,this.player.radius,this.x,this.y,this.radius)){
                    this.player.health+=50
                    this.eaten=true
                }
                
                break
            case 2:
                ctx.save()
                ctx.beginPath()
                ctx.arc(this.x,this.y,this.radius,0,2*Math.PI)
                ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius,  this.radius * 2, this.radius * 2)
                ctx.closePath()
                if(this.collision(this.player.x,this.player.y,this.player.radius,this.x,this.y,this.radius)){
                    this.home.health+=(this.home.max-this.home.health)*0.5
                    this.eaten=true
                }
                
                break
            case 3:
                ctx.save()
                ctx.beginPath()
                ctx.arc(this.x,this.y,this.radius,0,2*Math.PI)
                ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius,     this.radius * 2, this.radius * 2)
                ctx.closePath()
                if(this.collision(this.player.x,this.player.y,this.player.radius,this.x,this.y,this.radius)){
                    this.player.laser=true
                    this.eaten=true
                }
                break

        }
    }
}
function collision(x1,y1,r1,x2,y2,r2){
    return r1+r2>((x1-x2)**2+(y1-y2)**2)**(0.5)
}

let onlyBaseenemy
onlyBaseenemy=document.createElement('img')
onlyBaseenemy.src='files/enemyonlyhouse.png'

let bothPlayerBaseEnemy
bothPlayerBaseEnemy=document.createElement('img')
bothPlayerBaseEnemy.src='files/enemyhomeplayer.png'

let gameover=false
let start=0


function main(){
    console.log(window.innerHeight,window.innerWidth)
   if(gameover){
    highscoreupdate()
    gameoverscreen()
    start=2
   }
   if(start==0){
    startbackground()
    staticscreen()
    instructions()
    leaderboarddisp()
   }
   if(start==1){
    gamelogic()
    gamepretty()
   }
   if(!pause){
    request=requestAnimationFrame(main)
   }
} 


window.requestAnimationFrame(main)


let Enemy_delay=1500
let Boss_delay=3000
let damage=10
let home_health=2500
let home_base= new home(x/2,y/1.2,home_health,x/20,detectcollision)
enemyarray=[]
enemy1=[]
enemy2=[]
enemy3=[]
enemy4=[]
let lasertimer=500
let max_health=100
let playerspeed=window.innerWidth/746
let maxregen=100
let Player1 = new player(x/2,y/2,x/50,x/100,x/50,playerspeed,x-(x/100),home_base.y+home_base.radius/3,x/100,x/100,home_base,collision,max_health,enemyarray,damage,maxregen,lasertimer)
let firsttime=0
let Max_Count=10
let Max_melee=3
let tempmax=10
let tempmel=3
let Homing_count=1
let melee_count=0
let ecount=0
let score=0
let homecount=0
let bosscount=0
let bossspawned=false
let boss_basehealth=900
let basebossbullet=50
let basebosspellet=5

let lives=[1,1,1,1,1]
let lifecount=5
let bosskilled=0
let letboss=0
let bossarray=[]
let once=true

function gamelogic(){
    if(firsttime==0){
        enemyarray.push(enemy1)
        enemyarray.push(enemy2)
        enemyarray.push(enemy3)
        enemyarray.push(enemy4)
        for (let i=0;i<Max_Count;i++){
            generatespawn()
          
        }
        firsttime=1
    }
    if(ecount<Max_Count){
        generatespawn()
    }
    checkdeath()
    if(bosscount==5){
        if(letboss==0){
            bossarray.push( new boss(x/2,y/3,x/25,home_base,Player1,Boss_delay,window.innerWidth/3730,collision,boss_basehealth,basebossbullet,basebosspellet))
        }
        letboss=1
        bossspawned=true
    }
    checkgameover()
    high()
    addspawnables()
}

function gamepretty(){
   
    ctx.fillStyle = "black";
    let height=window.innerHeight
    let width=window.innerWidth
    ctx.fillRect(0,0, width, height);
    ctx.fillStyle="pink"
    ctx.fillRect(0,x/100,width,y/1000)
    ctx.fillRect(0,height-x/100,width,y/1000)
    ctx.fillRect(x/100,x/100,y/1000,height-(2*x/100))
    ctx.fillRect(width-1.5*x/100,x/100,y/1000,height-(2*x/100))
    drawgamedeets()
    generateStars(numStars)
    drawStars(stars)
    Player1.draw(ctx)
    home_base.draw()

    
    enemyarray.forEach((array)=>{
        array.forEach((enem)=>{
            enem.draw()
        }
        )
    })
    if(bossspawned){
        bossarray[bosskilled].draw()
        Max_Count=6
        Max_melee=2
    }
    if(spawned){
        spawnpowerups[0].draw()
    }

}

function checkgameover(){
    if(lifecount==0 || home_base.health<0){
        gameover=true
    }
}


function randomlocation(){
    let xw=window.innerWidth
    let yh=window.innerHeight
    return [(3*xw)/100 + (Math.random() * ((94*xw)/100)),(3*xw)/100 + (Math.random() * ((yh/1.2)-(x/10)))]

}

function generatespawn(){
    let n=Math.floor(Math.random()*4)+1
    if(n==1){
        let array=randomlocation()
        enemy1.push(new base_enemy(array[0],array[1],window.innerWidth/3730,x/50,home_base,Enemy_delay,[home_base],onlyBaseenemy,Player1,collision,100,5))
        ecount+=1
        return
    }
    if(n==2){
        let array=randomlocation()
        enemy2.push(new base_enemy(array[0],array[1],window.innerWidth/3730,x/50,home_base,Enemy_delay,[home_base,Player1],bothPlayerBaseEnemy,Player1,collision,100,5))
        ecount+=1
        return
    }
    if(n==3){
        if(melee_count<3){
            let array=randomlocation()
            ranangle=(Math.random()+1)* Math.PI
            enemy3.push(new homing_melee(array[0],array[1],home_base,ranangle,x/50,0.03))
            melee_count+=1
            ecount+=1
            return
        }
         else{
            let array=randomlocation()
            enemy1.push(new base_enemy(array[0],array[1],window.innerWidth/3730,x/50,home_base,Enemy_delay,[home_base],onlyBaseenemy,Player1,collision,100,5))
            ecount+=1
            return
        }
       
    }
    if(n==4){
        if(homecount<Homing_count){
            let array=randomlocation()
            enemy4.push(new homing_enemy(array[0],array[1],window.innerWidth/3730,x/50,Enemy_delay,3,Player1,home_base,collision,100))
            homecount+=1
            ecount+=1
            return

        }
        else{
            let array=randomlocation()
            enemy1.push(new base_enemy(array[0],array[1],window.innerWidth/3730,x/50,home_base,Enemy_delay,[home_base],onlyBaseenemy,Player1,collision,100,5))
            ecount+=1
            return
        }
    }
    

}

function checkdeath(){
    enemyarray.forEach((array)=>{
        array.forEach((enem)=>{
            if(enem.health<0){
                const index=array.indexOf(enem)
                array.splice(index,1)
                ecount-=1
            if(enem.class==1){
                score+=5
            }
            if(enem.class==2){
                score+=10
            }
            if(enem.class==3){
                score+=10
                melee_count-=1
            }
            if(enem.class==4){
                score+=15
                homecount-=1
                if(!bossspawned){
                    bosscount+=1
                }   
            }
            }
        })
    })
    if(Player1.health<0){
        lifecount-=1
        lives[lifecount]=0
        Player1.health=Player1.maxhealth
    }
    if(bossspawned){
        if(bossarray[bosskilled].health<0){
            score+=1000
            bossspawned=false
            bosscount=0
            bosskilled+=1
            boss_basehealth+=100
            basebossbullet+=10
            basebosspellet+=2
            Player1.maxhealth+=10
            home_base.max+=200
            home_base.health=home_base.max
            Player1.health=Player1.maxhealth
            home_base.health=home_health
            Player1.damage+=3
            tempmax+=3
            tempmel+=1
            Max_melee=tempmel
            Max_Count=tempmax
            lasertimer+=150
            Player1.gun1.maxearth+=50
            Player1.healable+=2
            Player1.lasertimer+=50
            letboss=0
        }
    }
    
}

let lifeyes=document.createElement('img')
lifeyes.src="files/lifeyes.png"

let lifeno=document.createElement('img')
lifeno.src="files/lifeno.png"

function drawgamedeets(){
    ctx.beginPath()
    ctx.moveTo(window.innerWidth,home_base.y+home_base.radius/2)
    ctx.lineTo(home_base.x+home_base.radius,home_base.y+home_base.radius/2)
    ctx.stroke()
    ctx.closePath()
    ctx.beginPath()
    ctx.moveTo(0,home_base.y+home_base.radius/2)
    ctx.lineTo(home_base.x-home_base.radius,home_base.y+home_base.radius/2)
    ctx.stroke()
    ctx.closePath()
    diff=(y-x/100-home_base.y+home_base.radius/2)/3
    ctx.font=  window.innerWidth/74.6 +'px Courier'
    ctx.fillStyle='white'
    ctx.fillText("Health:",x/50, home_base.y+home_base.radius/1.2)
    ctx.fillText(`${Math.trunc(Player1.health)}`,diff*2 +x/50, home_base.y+home_base.radius/1.2)
    ctx.fillText("Regen:",x/50+diff*3.5, home_base.y+home_base.radius/1.2)
    ctx.fillText(`${Math.trunc(Player1.regen)}`,diff*5.25 +x/50, home_base.y+home_base.radius/1.2)
    ctx.fillText("Score:",x-x/5,home_base.y+home_base.radius/1.2)
    ctx.fillText(`${score}`,x-x/10,home_base.y+home_base.radius/1.2)
    for(let i=0;i<5;i++){
        if(lives[i]==1){
            ctx.drawImage(lifeyes,x/2+10*x/100+(i*x/50), y/1.2+x/24, x/50,x/50)
        }
        else{
            ctx.drawImage(lifeno,x/2+10*x/100+(i*x/50), y/1.2+x/24, x/50,x/50)
        }
    }

}



function generateStars(numStars) {
    const stars = [];
    for (let i = 0; i < numStars; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        stars.push({ x, y });
    }
    return stars;
}

let value1=255
let value2=255
let value3=255

function drawStars(stars) {
    if(bossspawned){
        value2-=1
        value3-=1
        if(value2<0){
            value2=0
        }
        if(value3<0){
            value3=0
        }
    }
    else{
        value2+=1
        value3+=1
        if(value2>255){
            value2=255
        }
        if(value3>255){
            value3=255
        }
    }

    stars.forEach(star => {
        ctx.beginPath();
        let radius =Math.random() * 1.5
        let opacity=Math.random() * 0.5 + 0.5
        ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + value1+ ","+ value2+ "," +value3 +","+ `${opacity})`
        ctx.fill();
        ctx.closePath();
    });
}


const numStars = 500;
const stars = generateStars(numStars);


function pausegame(){
    if(!pause){

        ctx.fillStyle='rgba(128,128,128,0.25)'
        ctx.fillRect(0,0,window.innerWidth,window.innerHeight)
        staticscreen()
        window.cancelAnimationFrame(request)
        window.removeEventListener("keydown",Player1.keydown)
        window.removeEventListener("keyup",Player1.keyup);
        window.removeEventListener("mousemove",Player1.getmousecoord.bind(Player1))
        window.removeEventListener("mousedown",Player1.mousedown)
        window.removeEventListener("mouseup",Player1.mouseup)
        pause=true
        Player1.up=false
        Player1.down=false
        Player1.left=false
        Player1.right=false
        Player1.shootpressed=false
        Player1.selfheal=false
        Player1.healthpressed=false
        }
}

function playgame(){
    if(pause){
        
        window.addEventListener("keydown",Player1.keydown)
        window.addEventListener("keyup",Player1.keyup);
        window.addEventListener("mousemove",Player1.getmousecoord.bind(Player1))
        window.addEventListener("mousedown",Player1.mousedown)
        window.addEventListener("mouseup",Player1.mouseup)
        pause=false
        main()
    }

}
let xcoord,ycoord;
window.addEventListener('click',getcoord)
window.addEventListener('onmouseover',mousecoordinate)
function getcoord(e){
    if(e.button===0){
        xcoord=e.clientX
        ycoord=e.clientY
    }
    checkfrontpage()
    instructions()
    leaderboarddisp()
    console.log(gameover)
}

let instructionscalled=0
let leaderboardcalled=0

function checkfrontpage(){
    let height=window.innerHeight
    let width=window.innerWidth
    if(start==0){
        if(xcoord>width/3 && xcoord<2*width/3 && ycoord>11*height/20 && ycoord<11* height/20 +x/49.73 ){
            start=1
        }
    }
    if(start==0 || pause){
        //instructions
        if(xcoord>width/3 && xcoord<2*width/3 && ycoord>11*height/20+x/42.68 && ycoord<11* height/20 +x/42.68+x/49.73){
            instructionscalled=1
        }
        //leaderboard
        if(xcoord>width/3 && xcoord<2*width/3 && ycoord>11*height/20+x/21.3 && ycoord<11*height/20+x/21.3+x/49.73){
            leaderboardcalled=1
        }
           
    }
     
    if(start!=0 && pause){
        if(xcoord>width/3 && xcoord<2*width/3 && ycoord>11*height/20 && ycoord<11* height/20 +x/49.73 ){
            hold+=1
            playgame()
        }
    }
    if(instructionscalled==1){
        if(xcoord>7*x/16 && xcoord<9*x/16 && ycoord> 6*y/8 && ycoord<13*y/16 ){
            if(pause){
                playgame()
                hold+=1
            }
            instructionscalled=0
        }
    }
    if(leaderboardcalled==1){
        if(xcoord>7*x/16 && xcoord<9*x/16 && ycoord> 6*y/8 && ycoord<13*y/16 ){
            if(pause){
                playgame()
                hold+=1
            }
            leaderboardcalled=0
        }
    }
    
    if(gameover){
        console.log('hello')
        if(xcoord>width/3 && xcoord<2*width/3 && ycoord>11*y/20+x/42.6 && ycoord<11*y/20+x/42.6+x/49.3){
            gameclick=1
            console.log('hello')
        }
        if(gameclick==1){
            resetvariables()
            start=0
            gameover=false
            gameclick=0
        }
    }
}

function mousecoordinate(e){
    xhover=e.clientX
    yhover=e.clientY
}

function startbackground(){
    ctx.fillStyle = "black";
    let height=window.innerHeight
    let width=window.innerWidth
    ctx.fillRect(0,0, width, height)
    generateStars(numStars)
    drawStars(stars)
}

function staticscreen(){
    let height=window.innerHeight
    let width=window.innerWidth
    ctx.fillStyle='rgba(128,128,128,0.25)'
    ctx.fillRect(width/4,height/4,width/2,height/2)
    ctx.fillStyle='blue'
    ctx.font=window.innerWidth/37 +'px retro'
    ctx.fillText('Droid Defense',width/3 ,height/2,width/3)
    ctx.lineWidth=x/500
    console.log('hello')
    //start
    if(start==0){
        ctx.strokeStyle='rgba(0,0,255,0.75)'
        ctx.strokeRect(width/3,11*height/20,width/3,x/49.73)
        ctx.font=window.innerWidth/74+'px retro'
        ctx.fillStyle='rgba(0,0,255,0.50)'
        ctx.fillText('Start Game',x/596.8+width/3+x/746,11*height/20+x/53.28,width/3-x/298)
    }
    else{
        ctx.strokeStyle='rgba(0,0,255,0.75)'
        ctx.strokeRect(width/3,11*height/20,width/3,x/50)
        ctx.font=window.innerWidth/74+'px retro'
        ctx.fillStyle='rgba(0,0,255,0.50)'
        ctx.fillText('Resume',x/596.8+width/3+x/746,11*height/20+x/53.28,width/3-x/298)
    }
   
    //instructions
    ctx.strokeStyle='rgba(0,0,255,0.75)'
    ctx.strokeRect(width/3,11*height/20+x/42.68,width/3,x/49.73)
    ctx.font=window.innerWidth/74+'px retro'
    ctx.fillStyle='rgba(0,0,255,0.50)'
    ctx.fillText('Instructions',x/596.8+width/3+x/746,11*height/20+x/23.68,width/3-x/298)
    //leaderboard
    ctx.strokeStyle='rgba(0,0,255,0.75)'
    ctx.strokeRect(width/3,11*height/20+x/21.3,width/3,x/49.73)
    ctx.font=window.innerWidth/74+'px retro'
    ctx.fillStyle='rgba(0,0,255,0.50)'
    ctx.fillText('LeaderBoard',x/596.8+width/3+x/746,11*height/20+x/15.22,width/3-x/298)
    
    
}

function instructions(){

    if(instructionscalled==1){
        ctx.fillStyle='black'
        ctx.strokeStyle='rgba(0,0,255,0.75)'
        ctx.strokeRect(x/8,y/8,6*x/8,6*y/8)
        ctx.fillRect(x/8,y/8,6*x/8,6*y/8)
        ctx.strokeRect(7*x/16,6*y/8,x/8,y/16)
        ctx.fillStyle='blue'
        ctx.font=x/63+'px retro'
        ctx.fillText('Instructions',x/4,y/4,x/2)
        ctx.font=x/126+'px retro'
        ctx.fillStyle='rgba(255,255,255,0.75)'
        ctx.fillText('W',3*x/16,5*y/16,x/16)
        ctx.fillText('A',3*x/16,7*y/16,x/16)
        ctx.fillText('S',3*x/16,9*y/16,x/16)
        ctx.fillText('D',3*x/16,11*y/16,x/16)
        ctx.fillText('Left Click',x/2,5*y/16,x/8)
        ctx.fillText('Right Click',x/2,7*y/16,x/8)
        ctx.fillText('R',x/2,9*y/16,x/8)
        ctx.fillStyle='rgba(255,255,255,0.50)'
        ctx.font=x/180+'px retro'
        ctx.fillText('-to move up',3*x/16+x/16,5*y/16)
        ctx.fillText('-to move left',3*x/16+x/16,7*y/16)
        ctx.fillText('-to move down',3*x/16+x/16,9*y/16)
        ctx.fillText('-to move right',3*x/16+x/16,11*y/16)
        ctx.fillText('-to shoot',x/2+x/8,5*y/16)
        ctx.font=x/215+'px retro'
        //right
        ctx.fillText('-hold to charge and ',x/2+x/8,7*y/16)
        ctx.fillText('relase to shoot health shots',x/2,7.5*y/16)
        ctx.fillText('which can heal player base',x/2,8*y/16)
        //r
        ctx.fillText('-hold to charge and ',x/2+x/8,9*y/16)
        ctx.fillText('relase to heal player',x/2,9.5*y/16)
        ctx.fillStyle='rgba(255,255,255,0.75)'
        ctx.fillText('Spacebar to pause and play',x/2,10.25*y/16)
        ctx.font=x/210+'px retro'
        ctx.fillText('Game Over when Base health is 0',x/2,11*y/16)
        ctx.fillText('or when player loses all lives',x/2,11.5*y/16)

        if(start==0){
            ctx.font=x/84+'px retro'
            ctx.fillStyle='blue'
            ctx.fillText('Back',7*x/16+20,25*y/32+20,x/8-20)
        }
        else{
            ctx.font=x/84+'px retro'
            ctx.fillStyle='blue'
            ctx.fillText('Resume',7*x/16+20,25*y/32+20,x/8-20)
        }

    }    
}

function leaderboarddisp(){
    high()
    if(leaderboardcalled==1){
        ctx.fillStyle='black'
        ctx.strokeRect(x/8,y/8,6*x/8,6*y/8)
        ctx.fillRect(x/8,y/8,6*x/8,6*y/8)
        ctx.strokeRect(7*x/16,6*y/8,x/8,y/16)
        ctx.fillStyle='blue'
        ctx.font=x/74+'px retro'
        ctx.fillText('LeaderBoard',x/4,y/4,x/2)
        for(let i=0;i<5;i++){
            ctx.font=x/99.4+'px retro'
            ctx.fillStyle='rgba(255,255,255,0.75)'
            ctx.fillText(`${i+1}`,x/4,(i+4)*y/12)
            ctx.fillText(`${leadership[i]}`,5*x/8,(i+4)*y/12)
        }
        if(start==0){
            ctx.fillStyle='blue'
            ctx.fillText('Back',7*x/16+x/373,25*y/32+x/373,x/8-x/373)
        }
        else{
            ctx.fillStyle='blue'
            ctx.fillText('Resume',7*x/16+x/373,25*y/32+x/373,x/8-x/373)
        }
    }
}

function resetvariables(){
    hold=0
    x=window.innerWidth
    y=window.innerHeight
    ctx=backcanvas.getContext("2d")
    p=0.01*window.innerWidth
    q=0.01*window.innerHeight
    pause=false
    gameover=false
    Enemy_delay=1500
    Boss_delay=3000
    damage=10
    home_base= new home(x/2,y/1.2,2500,x/20,detectcollision)
    enemyarray=[]
    enemy1=[]
    enemy2=[]
    enemy3=[]
    enemy4=[]
    max_health=100
    playerspeed=window.innerWidth/746
    Player1 = new player(x/2,y/2,x/50,x/100,x/50,playerspeed,x-(x/100),home_base.y+home_base.radius/3,x/100,x/100,home_base,collision,max_health,enemyarray,damage,100)
    firsttime=0
    Max_Count=10
    Max_melee=3
    Homing_count=1
    melee_count=0
    ecount=0
    score=0
    homecount=0
    bosscount=0
    bossspawned=false
    lives=[1,1,1,1,1]
    lifecount=5
    value1=255
    value2=255
    value3=255
    home_health=2500
    boss_basehealth=1500
    basebossbullet=50
    basebosspellet=5
    letboss=0
    bossarray=[]
    tempmax=10
    tempmel=3
    gameclick=0
    spawned=false
    spawncheck=0
    spawnpowerups=[]
}

let leadership=[0,0,0,0,0]
const localhigh=['one','two','three','four','five']
let val1  

function high(){
    for(let i=0;i<5;i++){
        val1=localStorage.getItem(localhigh[i])
        if(val1==null){
            leadership[i]=0
        }
        else{
            leadership[i]=JSON.parse(val1)
        }
    }
}

function highscoreupdate(){
    if(!leadership.includes(score)){
        leadership.push(score)
        leadership.sort((a,b)=>b-a)
        leadership.pop()
    }
    for(let i=0;i<5;i++){
        localStorage.setItem(localhigh[i],JSON.stringify(leadership[i]))
    }
}
let spawned=false
let spawncheck=0
let spawnpowerups=[]
let timer
let typespawn

function addspawnables(){
    if(!spawned){
        if(spawncheck==0){
            timer=Math.random()*1000 + 4000
            spawncheck=1
        }   
        timer-=1
    }
    if(timer<0 && !spawned){
        typespawn=Math.floor(Math.random()*3)+1
        switch(typespawn){
            case 1:
                 arrrayspan=randomlocation()
                spawnpowerups.push(new spawnables(arrrayspan[0],arrrayspan[1],1,x/100,Player1,collision,selfimg,home_base))
                break;
            case 2:
                arrrayspan=randomlocation()
                spawnpowerups.push(new spawnables(arrrayspan[0],arrrayspan[1],2,x/100,Player1,collision,earthhealimg,home_base))
                break;
             case 3:
                arrrayspan=randomlocation()
                spawnpowerups.push(new spawnables(arrrayspan[0],arrrayspan[1],3,x/100,Player1,collision,laserimg,home_base))
                break;
        }
        spawned=true
    }
    if(spawned && spawnpowerups[0].eaten==true){
        
        spawnpowerups.pop()
        spawned=false
        spawncheck=0
    }
}


let gameclick=0

function gameoverscreen(){
    ctx.fillStyle='black'
    ctx.fillRect(0,0,window.innerWidth,window.innerHeight)
    ctx.strokeStyle='rgba(0,0,255,0.75)'
    ctx.strokeRect(x/8,y/8,6*x/8,6*y/8)
    ctx.fillStyle='black'
    ctx.strokeRect(x/8,y/8,6*x/8,6*y/8)
    ctx.fillStyle='blue'
    ctx.font=x/60+'px retro'
    ctx.fillText('GAME OVER',x/4,y/4,x/2)
    ctx.strokeStyle='rgba(0,0,255,0.75)'
    ctx.strokeRect(x/3,11*y/20+x/42.6,x/3,x/49.3)
    ctx.font=x/74.6+'px retro'
    ctx.fillStyle='rgba(0,0,255,0.50)'
    ctx.fillText('Play Again',x/596.8+x/3+x/746,11*y/20+x/23.68,x/3-x/298.4)
}