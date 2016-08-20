def scene_init():
    global init_value_box, ball_spd_box, count, ball
    display(width = 700, height = 700, background = vec(1, 1, 1),center = vec(0, 0.25, 0), range = 1.5, forward = vec(0, -0.8, -1))
    floor = box(length = 3, height = 0.01, width = 2, texture=dict(file=textures.wood))
    init_value_box = label(pos=vec(-0.45, 1.40, 0), text = 'Initial values:\nFriction: 0.5\nSpeed:', height = 25, border = 15, font = 'monospace', color = color.black)
    ball_spd_box = label(pos=vec(0.45, 1.40, 0), text = 'Speed:', height = 25, border = 15, font = 'monospace', color = color.black)
    count = 0
    ball = sphere(radius = 0.35, pos = vec(0, 0.35, 0.1), texture=dict(file=textures.earth, bumpmap=bumpmaps.stucco))


def draw_animation(data):
    global init_value_box, ball_spd_box, count, ball, previous_speed, speed, dt
    speed = data[0]
    init_value_box.text = 'Initial values:\nFriction: 0.5\nSpeed: ' + str(round(speed))
    dt = 0.001
    g = 9.8
    m = 0.5
    fric_coef = 0.5
    s = 0.01
    ball_inertia = 2 * m * 0.35 ** 2 / 3
    torque = fric_coef * m * g * s
    count = 0
    previous_speed = speed

    def step():
        if ida.suspended:
            rate(1000, step)
            return

        global dt, count, previous_speed, speed, running
        a = (torque / ball_inertia) * (speed > 0 ? -1 : 1);
        speed += a * dt
        delta_angle = speed * dt + 0.5 * a * dt ** 2
        ball.rotate(angle = delta_angle, axis = vec(0,1,0))
        if count % 10 == 0:
            ball_spd_box.text = 'Speed:' + str(round(speed))

        count += 1
        if previous_speed * speed <= 0:
            running = False
            return
        else:
            rate(1000, step)

        previous_speed = speed

    step()


def Speed(data):
    global running
    if not running:
        running = True
        console.log('Speed:', data)
        draw_animation(data)


def iot_app():
    scene_init()


speed = 0
running = False


profile = {
    'dm_name': 'Ball-Spin',
    'df_list': [Speed]
}
ida = {
    'iot_app': iot_app
}
dai(profile, ida)
