 
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
    constructor(x,y,a,w,h,speed,boundx,boundy,topbx,topby,home,collision,health,enemies,damage,regen){
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
        this.maxhealth=health
        this.home=home
        this.collision=collision
        this.enemies=enemies
        this.damage=damage
        this.regen=regen
        this.selfhealmeter=0
        this.gun1= new gun(this,this.x,this.y,this.gunwidth,this.gunheight,this.angle,this.shootpressed,20,this.healthpressed,this.home)


        window.addEventListener("keydown",this.keydown);
        window.addEventListener("keyup",this.keyup);
        window.addEventListener("mousemove",this.getmousecoord.bind(this))
        window.addEventListener("mousedown",this.mousedown)
        window.addEventListener("mouseup",this.mouseup)
    }

    draw(ctx){
        console.log(this.health)
        this.movement()
        this.playerimg=document.createElement('img')
        this.playerimg.src='files/player.png'
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI)
        ctx.clip
        
        ctx.drawImage(this.playerimg, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2)
        ctx.closePath()
        ctx.restore()
        this.gun1.draw()
        this.healthbar()
        if(this.health>this.maxhealth){
            this.health=this.maxhealth
        }
        if(this.regen>100){
            this.regen=100
        }
        if(this.selfheal){
            if(this.regen>10){
                this.selfhealmeter+=1
                this.healnow=true
            }
            else{
                this.maxselfhealmeter=(this.regen/10)*200
                this.selfhealmeter+=1
                if(this.selfhealmeter>this.maxselfhealmeter){
                    this.selfhealmeter=this.maxselfhealmeter
                    this.healnow=true
                }
            }
        }
        if(!(this.selfheal)){
            if(this.healnow){
                if(this.selfhealmeter>200){
                    this.health+=20
                    this.regen-=10
                }
                else{   
                    this.health+=(this.selfhealmeter/200)*20
                    this.regen-=(this.selfhealmeter/200)*10
                }
                
            }
            this.healnow=false
            this.selfhealmeter=0
        }
        if(this.selfheal){
            ctx.beginPath()
            ctx.arc(this.x,this.y,this.radius+10,0,((this.selfhealmeter)/200)*Math.PI*2)
            ctx.strokeStyle='green'
            ctx.lineWidth=10
            ctx.stroke()
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
        
            for(let i=0; i <this.player.enemies[0].length;i++){
                if(this.player.collision(bullet.x,bullet.y,bullet.radius,this.player.enemies[0][i].x,this.player.enemies[0][i].y,this.player.enemies[0][i].radius)){
                    const index = this.bullets.indexOf(bullet)
                    this.bullets.splice(index,1)
                    this.player.regen+=this.player.damage/12
                    this.player.enemies[0][i].health-=this.player.damage
                   
                }
            }
            for(let i=0; i <this.player.enemies[1].length;i++){
                if(this.player.collision(bullet.x,bullet.y,bullet.radius,this.player.enemies[1][i].x,this.player.enemies[1][i].y,this.player.enemies[1][i].radius)){
                    const index = this.bullets.indexOf(bullet)
                    this.bullets.splice(index,1)
                    this.player.regen+=this.player.damage/8
                    this.player.enemies[1][i].health-=this.player.damage*1.5
                   
                }
            }
            for(let i=0; i <this.player.enemies[2].length;i++){
                if(this.player.collision(bullet.x,bullet.y,bullet.radius,this.player.enemies[2][i].x,this.player.enemies[2][i].y,this.player.enemies[2][i].radius)){
                    const index = this.bullets.indexOf(bullet)
                    this.bullets.splice(index,1)
                    this.player.regen+=this.player.damage/6
                    this.player.enemies[2][i].health-=this.player.damage*2
                   
                }
            }
            for(let i=0; i <this.player.enemies[3].length;i++){
                if(this.player.collision(bullet.x,bullet.y,bullet.radius,this.player.enemies[3][i].x,this.player.enemies[3][i].y,this.player.enemies[3][i].radius)){
                    const index = this.bullets.indexOf(bullet)
                    this.bullets.splice(index,1)
                    this.player.regen+=this.player.damage/16
                    this.player.enemies[3][i].health-=this.player.damage*(3/4)
                   
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
        }
            
        )

        this.rotate()

        if(this.healthpress){
            ctx.beginPath()
            ctx.arc(this.x,this.y,this.player.radius+10,0,((this.healthmeter)/200)*Math.PI*2)
            ctx.strokeStyle='blue'
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
        let speed=7
        if(this.healthpress){

            if(this.player.regen>10){
                this.healthmeter+=1
                this.bulletadd=true
                
            }
            else{
                
                this.maxhealmeter=(this.player.regen/10)*200
        
                this.healthmeter+=1
                if(this.healthmeter>this.maxhealmeter){
                    this.healthmeter=this.maxhealmeter
                    this.bulletadd=true
                }
            }
        }
    
        if(!(this.healthpress)){
            if(this.bulletadd){
            
                this.healthbullets.push(new health_pellet(this.x,this.y,speed,this.width,this.rotateang,this.player,this.healthmeter))
            }
            if(this.healthmeter>200){
                this.player.regen-=10
            }
            else{
                this.player.regen-=(this.healthmeter/200 ) *10
            }
            this.bulletadd=false
            this.healthmeter=0
        }
    }
}

class health_pellet{
    constructor(x,y,speed,gunwidth,angle,player,healing){
        this.x=x
        this.y=y
        this.radius=gunwidth/2
        this.speed=speed
        this.angletravel=angle
        this.player=player
        this.healing=healing
    }
    draw(){
        ctx.beginPath()
        ctx.arc(this.x+((this.player.radius)*Math.sin(-this.angletravel)),this.y+((this.player.radius)*Math.cos(this.angletravel)),this.radius,0,2*Math.PI)
        this.x+=this.speed*Math.sin(-this.angletravel)
        this.y+=this.speed*Math.cos(-this.angletravel)
        ctx.fillStyle='green'
        ctx.fill()
        if(this.healing>200){
            this.healed=75
        }
        else{
             this.healed=(this.healing/200)*75
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
                ctx.font='100px Courier'
                
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
        this.class=14
       }
       else{
        this.class=2
       }
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
        this.enembullets.push(new enemy_bullet(this.x,this.y,20,this.radius/5,this.targetangle,this))
        
    }

    offscreen(bullet){
        return (bullet.x+(bullet.radius)>this.player.boundxe || bullet.y+(bullet.radius)>this.player.boundye || bullet.x-(bullet.radius)<this.player.topx || bullet.y-(bullet.radius)<this.player.topy)
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
        this.speed=2
        this.health=100
        this.class=3
        this.damage=damage
        
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
}



class boss{
    constructor(x,y,radius,home,player,delay,speed,collision,health){
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
    }

    draw(){
        console.log(this.health)
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
        
    }

    targetlocation(){
        let xw=window.innerWidth
        let yh=window.innerHeight
        this.targetx=(5*xw)/100 + (Math.random() * ((90*xw)/100))
        this.targety=(5*xw)/100 +(Math.random() * ((yh/2)-((9*x)/100)))
    }

    movement(){
        this.angletravel=Math.atan2(this.targety-this.y,this.targetx-this.x)
        console.log(this.angletravel)
        console.log(this.x,this.y)
        console.log(this.speed)
        console.log(this.speed*(Math.cos(this.angletravel)))
        this.x+=this.speed*(Math.cos(this.angletravel))
        console.log(this.x)
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
        this.bigammo.push(new bossbullet(this.x,this.y,10,this.radius/4,this.targetangle,this,50))
        
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
            this.bosspellets.push(new bosspellet(this.x,this.y,15,this.radius/10,((i+1)/50)*Math.PI*2,this,5))
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
                this.health-=this.player.damage/5
                this.player.regen+=this.player.damage/60
            }
        })
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
            this.homebullets.push( new homebullet(this.x,this.y,this.radius/5,7,this.player,this.home,this))
        }
    }
    offscreen(bullet){
        return (bullet.x+(bullet.radius)>this.player.boundxe || bullet.y+(bullet.radius)>this.player.boundye || bullet.x-(bullet.radius)<this.player.topx || bullet.y-(bullet.radius)<this.player.topy)
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
    console.log(x,y)
   if(gameover){
    if(confirm("you've lost press ok to restart")){
        
        window.location.reload()
    }
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
let home_base= new home(x/2,y/1.2,2500,x/20,detectcollision)
enemyarray=[]
enemy1=[]
enemy2=[]
enemy3=[]
enemy4=[]
let Player1 = new player(x/2,y/2,x/50,x/100,x/50,10,x-(x/100),home_base.y+home_base.radius/3,x/100,x/100,home_base,collision,200,enemyarray,damage,100)
let firsttime=0
let Max_Count=10
let Max_melee=3
let Homing_count=1
let melee_count=0
let ecount=0
let score=0
let homecount=0
let bosscount=5
let bossspawned=false
let boss_enemy= new boss(x/2,y/3,x/25,home_base,Player1,Boss_delay,2,collision,10)
let lives=[1,1,1,1,1]
let lifecount=5

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
        bossspawned=true
    }
    checkgameover()
   

    
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
        boss_enemy.draw()
        Max_Count=6
        Max_melee=2
    }

}

function checkgameover(){
    if(lifecount==0 || home_base.health==0){
        gameover=true
    }
}


function randomlocation(){
    let xw=window.innerWidth
    let yh=window.innerHeight
    return [(3*xw)/100 + (Math.random() * ((94*xw)/100)),(3*xw)/100 + (Math.random() * ((yh/1.2)-(x/10)))
]
}

function generatespawn(){
    let n=Math.floor(Math.random()*4)+1
    if(n==1){
        let array=randomlocation()
        enemy1.push(new base_enemy(array[0],array[1],2,x/50,home_base,Enemy_delay,[home_base],onlyBaseenemy,Player1,collision,100,5))
        ecount+=1
        return
    }
    if(n==2){
        let array=randomlocation()
        enemy2.push(new base_enemy(array[0],array[1],2,x/50,home_base,Enemy_delay,[home_base,Player1],bothPlayerBaseEnemy,Player1,collision,100,5))
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
            enemy1.push(new base_enemy(array[0],array[1],2,x/50,home_base,Enemy_delay,[home_base],onlyBaseenemy,Player1,collision,100,5))
            ecount+=1
            return
        }
       
    }
    if(n==4){
        if(homecount<Homing_count){
            let array=randomlocation()
            enemy4.push(new homing_enemy(array[0],array[1],2,x/50,Enemy_delay,3,Player1,home_base,collision,100))
            homecount+=1
            ecount+=1
            return

        }
        else{
            let array=randomlocation()
            enemy1.push(new base_enemy(array[0],array[1],2,x/50,home_base,Enemy_delay,[home_base],onlyBaseenemy,Player1,collision,100,5))
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
                bosscount+=1
            }
            }
        })
    })
    if(Player1.health<0){
        lifecount-=1
        lives[lifecount]=0
        Player1.health=Player1.maxhealth
    }
    if(boss_enemy.health<0){
        bossspawned=false
        bosscount+=1
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
    ctx.font=  '100px Courier'
    ctx.fillStyle='white'
    ctx.fillText("Health:",x/50, home_base.y+home_base.radius/1.2)
    ctx.fillText(`${Math.trunc(Player1.health)}`,diff*2 +x/50, home_base.y+home_base.radius/1.2)
    ctx.fillText("Regen:",x/50+diff*3.5, home_base.y+home_base.radius/1.2)
    ctx.fillText(`${Math.trunc(Player1.regen)}`,diff*5.25 +x/50, home_base.y+home_base.radius/1.2)
    ctx.fillText("Score:",x-x/5,home_base.y+home_base.radius/1.2)
    ctx.fillText(`${score}`,x-x/10,home_base.y+home_base.radius/1.2)
    for(let i=0;i<5;i++){
        if(lives[i]==1){
            ctx.drawImage(lifeyes,x/2+10*x/100+(i*160), y/1.2+x/24, 150,150)
        }
        else{
            ctx.drawImage(lifeno,x/2+10*x/100+(i*160), y/1.2+x/24, 150,150)
        }
    }

}

function drawborder(){
    let gradient1 = ctx.createLinearGradient(0,0,0,window.innerWidth/100)
    gradient1.addColorStop(0, 'black')
    gradient1.addColorStop(1, 'gray')
    ctx.fillStyle=gradient1
    ctx.fillRect(window.innerWidth/100,0,window.innerWidth*0.99,window.innerWidth/100)
    let gradient2 = ctx.createLinearGradient(0,window.innerHeight-window.innerWidth/100,0,window.innerHeight)
    gradient2.addColorStop(0, 'gray')
    gradient2.addColorStop(1, 'black')
    ctx.fillStyle=gradient2
    ctx.fillRect(window.innerWidth/100,window.innerHeight-window.innerWidth/100,window.innerWidth,window.innerHeight)
    let gradient3 = ctx.createLinearGradient(0,0,window.innerWidth/100,0)
    gradient3.addColorStop(0, 'black')
    gradient3.addColorStop(1, 'gray')
    ctx.fillStyle=gradient3
    ctx.fillRect(0,window.innerWidth/100,window.innerWidth/100,window.innerHeight-window.innerWidth/100)
    let gradient4=ctx.createLinearGradient(window.innerWidth*0.99,0,window.innerWidth,0)
    gradient4.addColorStop(0, 'black')
    gradient4.addColorStop(1, 'gray')
    ctx.fillStyle='red'
    ctx.fillRect(window.innerWidth-window.innerWidth/100,window.innerWidth/100,window.innerWidth,window.innerHeight-window.innerWidth/100)
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
        let radius =Math.random() * 2
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
}

let instructionscalled=0
let leaderboardcalled=0

function checkfrontpage(){
    let height=window.innerHeight
    let width=window.innerWidth
    if(start==0){
        if(xcoord>width/3 && xcoord<2*width/3 && ycoord>11*height/20 && ycoord<11* height/20 +150 ){
            start=1
        }
    }
    if(start==0 || pause){
        //instructions
        if(xcoord>width/3 && xcoord<2*width/3 && ycoord>11*height/20+175 && ycoord<11* height/20 +325){
            instructionscalled=1
        }
        //leaderboard
        if(xcoord>width/3 && xcoord<2*width/3 && ycoord>11*height/20+350 && ycoord<11* height/20 +500){
            leaderboardcalled=1
        }
           
    }
     
    if(start!=0 && pause){
        if(xcoord>width/3 && xcoord<2*width/3 && ycoord>11*height/20 && ycoord<11* height/20 +150 ){
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
    ctx.font='bold 200px retro'
    ctx.fillText('Droid Defense',width/3 ,height/2,width/3)
    ctx.lineWidth=x/500
   
    //start
    if(start==0){
        ctx.strokeStyle='rgba(0,0,255,0.75)'
        ctx.strokeRect(width/3,11*height/20,width/3,150)
        ctx.font='100px retro'
        ctx.fillStyle='rgba(0,0,255,0.50)'
        ctx.fillText('Start Game',12.5+width/3+10,11*height/20+140,width/3-25)
    }
    else{
        ctx.strokeStyle='rgba(0,0,255,0.75)'
        ctx.strokeRect(width/3,11*height/20,width/3,150)
        ctx.font='100px retro'
        ctx.fillStyle='rgba(0,0,255,0.50)'
        ctx.fillText('Resume',12.5+width/3+10,11*height/20+140,width/3-25)
    }
   
    //instructions
    ctx.strokeStyle='rgba(0,0,255,0.75)'
    ctx.strokeRect(width/3,11*height/20+175,width/3,150)
    ctx.font='100px retro'
    ctx.fillStyle='rgba(0,0,255,0.50)'
    ctx.fillText('Instructions',12.5+width/3+10,11*height/20+315,width/3-25)
    //leaderboard
    ctx.strokeStyle='rgba(0,0,255,0.75)'
    ctx.strokeRect(width/3,11*height/20+350,width/3,150)
    ctx.font='100px retro'
    ctx.fillStyle='rgba(0,0,255,0.50)'
    ctx.fillText('LeaderBoard',12.5+width/3+10,11*height/20+490,width/3-25)
    
    
}

function instructions(){

    if(instructionscalled==1){
        ctx.fillStyle='black'
        ctx.strokeRect(x/8,y/8,6*x/8,6*y/8)
        ctx.fillRect(x/8,y/8,6*x/8,6*y/8)
        ctx.strokeRect(7*x/16,6*y/8,x/8,y/16)
    }    
}

function leaderboarddisp(){
    if(leaderboardcalled==1){
        ctx.fillStyle='black'
        ctx.strokeRect(x/8,y/8,6*x/8,6*y/8)
        ctx.fillRect(x/8,y/8,6*x/8,6*y/8)
        ctx.strokeRect(7*x/16,6*y/8,x/8,y/16)

    }
}
