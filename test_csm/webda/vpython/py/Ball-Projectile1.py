axis = []
labels = []

def axisInit():
    global axis, labels
    a = 0
    b = 0
    c = 500
    d = 200
    axis.append(arrow(pos=vec(a,b,0), axis=vec(c+50,0,0), shaftwidth= 1, color = color.white))
    axis.append(arrow(pos=vec(a,b,0), axis=vec(0,d+50,0), shaftwidth= 1, color = color.white))
    
    for t in range(0,20):
        axis.append(box(pos=vec(a + (t+1)*(c/20),b+d/2,0), length=1, height=d, width=1))
    
    for j in range(0,10):
        axis.append(box(pos=vec(a + c/2,b + (j+1)*(d/10),0), length=c, height=1, width=1,color=color.gray(0.8)))
    
    for x in range(0,6):
        num = str(x*(c/5))
        labels.append(label(pos=vec(a + x*(c/5),b-2*d/20,0), text = num, height = 20, border = 12, font = 'monospace', color = color.white, box = False))
    
    for y in range(0,6):
        num = str(b+y*(d/5))
        labels.append(label(pos=vec(a-2*c/40,b + y*(d/5),0), text = num, height = 20, border = 12, font = 'monospace', color = color.white, box = False))

def projectileInit():
    global scene, init_value_box, ball_pos_box
    scene = display(width=800, height=600,forward=vec(0.5,-0.05,-1), background=vec(0.6,0.3,0.2),center =vec (200,100,0), range = 250)
    floor = box(length=500,height=0.5,width=250,pos = vec(250,0,0),color=vec(0,1,0))  
    init_value_box = label(pos=vec(200,300,0), text= 'Initial values:\n' + 'Height:' + '\nAngle:' + '\nSpeed:', height=20, border=10, font='monospace', color = color.white)
    ball_pos_box = label(pos=vec(400,300,0), text= 'Position:\nX:' + '\nY:' + '\nZ:', height=20, border=10, font='monospace', color = color.white)
    axisInit()
    
def projectile_motion(data): #odf = (height, included angle, speed)
    global init_value_box, ball_pos_box, ball_touch
    height = data[0]
    angle = data[1] * 2 * 3.14 / 360
    speed = data[2]
    ball = sphere(pos = vec(0, height + 8.25, 0), radius = 8, color = color.white)
    ball.velocity = vector(speed * cos(angle), speed * sin(angle), 0)
    init_value_box.text = 'Initial values:\n' + 'Height:' + str(round(data[0], 1)) + '\nAngle:' + str(round(data[1], 1)) + '\nSpeed:' + str(round(data[2], 1))
    console.log(data[2])
    g = 9.8 
    dt = 0.003
    ball_touch = 0
    frame_count = 0
    def jump(): 
        global frame_count, isExist, ball_touch
        a = vector(0, -g, 0)
        ball.pos = ball.pos + ball.velocity * dt + 0.5 * a * (dt ** 2)
        if ball.pos.y < 8.25 and ball.velocity.y < 0:
            ball.velocity.y = - ball.velocity.y
            ball_touch += 1
        else:
            ball.velocity = ball.velocity + a * dt
        if ball.pos.x > 500 or ball_touch >= 10:
            ball.visible = False
            rate(2, progress)
            return
        else:
            rate(1000, jump)
        if frame_count % 10 == 0:
            ball_pos_box.text = 'Position:\nX:' + str(round(ball.pos.x,1)) + '\nY:' + str(round(ball.pos.y,1)) + '\nZ:' + str(ball.pos.z)
        frame_count += 1
    jump()
    

speed = 0
angle = 45
position = 40

def angleHandler(data):
    global angle
    if data != None:
        angle = data

def positionHandler(data):
    global position
    if data != None:
        position = data

def speedHandler(data):
    global isExist, speed
    if (data != None) and (data > 0):
        speed = data
        console.log("aaa:" + data)
        projectile_motion([position, angle, speed])
    else:
        rate(2, progress)

def progress():
    csmPull('Angle', angleHandler)
    csmPull('Height', positionHandler)
    csmPull('Speed', speedHandler)

def setup():
    profile = {
    'dm_name': 'Ball-Projectile',
    'df_list': ['Angle', 'Speed', 'Height']
    }
    csmRegister(profile)
    projectileInit()
    progress()

setup()

    
