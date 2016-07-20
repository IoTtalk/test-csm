import argparse
import threading
import os
import time
import json

import tornado.ioloop
import tornado.websocket
import tornado.web


ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_PATH = os.path.join(ROOT_DIR, 'static')
WEB_DA_PATH = os.path.join(ROOT_DIR, 'web_da')
HISTORY_MAX = 5
CONTROL_IDF = '__Ctl_I__'
CONTROL_ODF = '__Ctl_O__'

containers = {}


logging_lookbehind = {}


def setup_containers():
    register(
        'EASYCONNECT_PANEL',
        {
            'profile': {
                'd_name': 'EasyConnect Panel',
                'dm_name': 'Panel',
                'u_name': 'cychih',
                'is_sim': False,
                'df_list': ['Level', 'Button']
            }
        }
    )


def logging(tag, msg='', *, args=tuple()):
    name = threading.current_thread().name
    if name not in logging_lookbehind:
        logging_lookbehind[name] = None

    if not args:
        args = ''
    elif isinstance(args, list):
        args = tuple(args)
    elif not isinstance(args, tuple):
        args = '({})'.format(args)

    output = '[{}] {}: {}'.format(tag, args, msg)

    if logging_lookbehind[name] != output:
        print(output)
        logging_lookbehind[name] = output


def sorted_dict(dt):
    return sorted(dt.items(), key=lambda x: x[0])


class BaseHandler(tornado.web.RequestHandler):
    def set_extra_headers(self, path):
        self.set_header("Cache-control", "no-cache")


    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, DELETE, GET, OPTIONS')


class TreeHandler(BaseHandler):
    ''' This class handles tree API '''
    def get(self):
        logging('tree', 'OK')
        self.finish(json.dumps(
            {da_id: containers[da_id]['profile']['df_list'] for da_id in containers}
        ))


class MonitorHandler(BaseHandler):
    ''' This class handles the monitor page '''
    def get(self):
        logging('monitor', 'OK')
        self.render('templates/list_all.html',
                containers=containers,
                sorted_dict=sorted_dict)


class SessionHandler(BaseHandler):
    ''' This class handles register/deregister API '''
    def post(self, d_id):
        log_tag = 'register'
        profile = tornado.escape.json_decode(self.request.body)
        for attr in ('d_name', 'dm_name', 'u_name', 'is_sim', 'df_list'):
            if attr not in profile['profile']:
                msg = '{} not in profile'.format(attr)
                logging(log_tag, msg, args=d_id)
                self.return_404(msg)
                return

        register(d_id, profile)

        logging(log_tag, 'OK', args=d_id)
        self.finish('OK')

    def delete(self, d_id):
        log_tag = 'deregister'
        if d_id not in containers:
            self.return_404(log_tag, 'd_id not found')
            return

        deregister(d_id)

        logging(log_tag, 'OK', args=d_id)
        self.finish('OK')

    def options(self):
        # no body
        self.set_status(204)
        self.finish()

    def return_404(self, log_args, msg='NO'):
        self.clear()
        self.set_status(404)
        self.finish(msg)


def register(d_id, profile):
    containers[d_id] = profile
    if containers[d_id]['profile'] is not None:
        df_list = containers[d_id]['profile']['df_list']

        if CONTROL_IDF not in df_list:
            df_list.append(CONTROL_IDF)
        if CONTROL_ODF not in df_list:
            df_list.append(CONTROL_ODF)

        containers[d_id]['profile']['df_list'] = df_list
        if isinstance(df_list, list):
            for df_name in df_list:
                containers[d_id][df_name] = []

    containers[d_id]['selected'] = {
        df_name: False for df_name in df_list if not df_name.startswith('_')
    }

    MyWebSocketHandler.broadcast('RELOAD')


def deregister(d_id):
    del containers[d_id]
    MyWebSocketHandler.broadcast('RELOAD')


def push(d_id, df_name, data):
    t = '{:.6f}'.format(time.time())
    containers[d_id][df_name].insert(0, [t, data])
    if len(containers[d_id][df_name]) > HISTORY_MAX:
        containers[d_id][df_name].pop()

    MyWebSocketHandler.broadcast('DATA|{}|{}|{}'.format(
            d_id, df_name,
            data_repr([t, data])
        )
    )


def data_repr (data):
    return '{} [{}]'.format(
        data[0],
        ', '.join(
            '{:.5}'.format(p) if isinstance(p, float) else str(p) for p in data[1]
        )
    )


class DataHandler(BaseHandler):
    ''' This class handles push/pull API '''
    def put(self, d_id, df_name):
        log_tag = 'push'

        if d_id not in containers:
            msg = 'd_id not found'
            logging(log_tag, msg, args=(d_id, df_name))
            self.return_404(msg)
            return

        if df_name not in containers[d_id]['profile']['df_list']:
            msg = 'feature not found: {}'.format(df_name)
            logging(log_tag, msg, args=(d_id, df_name))
            self.return_404(msg)
            return

        if df_name not in containers[d_id]:
            containers[d_id][df_name] = []

        try:
            push(d_id, df_name, tornado.escape.json_decode(self.request.body)['data'])
        except json.decoder.JSONDecodeError:
            logging(log_tag, 'JSON ERROR: {}'.format(self.request.body), args=(d_id, df_name))
            self.finish()
        else:
            logging(log_tag, 'OK', args=(d_id, df_name))
            self.finish('OK')

    def get(self, d_id, df_name):
        log_tag = 'pull'

        if d_id not in containers:
            msg = 'd_id {} not found'.format(d_id)
            logging(log_tag, msg, args=(d_id, df_name))
            self.return_404(msg)
            return

        if df_name not in containers[d_id]['profile']['df_list'] + ['profile']:
            msg = 'feature not found: {}'.format(df_name)
            logging(log_tag, msg, args=(d_id, df_name))
            self.return_404(msg)
            return

        if df_name not in containers[d_id]:
            containers[d_id][df_name] = []

        if df_name == 'Display':
            collection = {}
            for d_id_ in containers:
                collection[containers[d_id_]['profile']['d_name']] = {}
                for df_name_ in containers[d_id_]['profile']['df_list']:
                    if df_name_ in containers[d_id_] and len(containers[d_id_][df_name_]) > 0:
                        collection[containers[d_id_]['profile']['d_name']][df_name_] = containers[d_id_][df_name_][0][1]

                if len(collection[containers[d_id_]['profile']['d_name']]) == 0:
                    del collection[containers[d_id_]['profile']['d_name']]

            ret = [[
                str(time.time()),
                [collection]
            ]]
        else:
            ret = containers[d_id][df_name]

        logging(log_tag, 'OK', args=(d_id, df_name))
        self.finish(json.dumps({'samples': ret}))

    def options(self):
        # no body
        self.set_status(204)
        self.finish()

    def return_404(self, log_args, msg='NO'):
        self.clear()
        self.set_status(400)
        self.finish(msg)


class MyWebSocketHandler(tornado.websocket.WebSocketHandler):
    websockets = set()

    @classmethod
    def broadcast(cls, msg):
        for ws in cls.websockets:
            ws.write_message(msg)

    def open(self):
        logging('websocket', 'WebSocket opened')
        self.websockets.add(self)

    def on_message(self, message):
        cmd, *args = message.split('|')
        logging('websocket', (cmd, args))
        if cmd == 'RESUME':
            d_id = args[0]
            push(d_id, CONTROL_ODF, ['RESUME', {'cmd_params': []}])
        elif cmd == 'SUSPEND':
            d_id = args[0]
            push(d_id, CONTROL_ODF, ['SUSPEND', {'cmd_params': []}])
        elif cmd == 'SELECT':
            d_id = args[0]
            df_name = args[1]
            containers[d_id]['selected'][df_name] ^= True
            self.broadcast(
                '{}|{}|{}'.format(
                    'SELECT' if containers[d_id]['selected'][df_name] else 'UNSELECT',
                    d_id, df_name
                )
            )
        elif cmd == 'SET_DF_STATUS':
            d_id = args[0]
            df_list = containers[d_id]['profile']['df_list']
            select_flags = containers[d_id]['selected']
            flags = ''.join(
                map(
                    lambda x: '1' if select_flags[x] else '0',
                    filter(
                        lambda x: not x.startswith('_'),
                        df_list
                    )
                )
            )
            push(d_id, CONTROL_ODF, ['SET_DF_STATUS', {'cmd_params': [flags]}])
        elif cmd == 'DEREGISTER':
            d_id = args[0]
            deregister(d_id)
            pass

    def on_close(self):
        logging('websocket', 'WebSocket closed')
        self.websockets.remove(self)
        # MyWebSocketHandler.broadcast('one user offline from {}'.format(self.request.remote_ip))

    def ping(self, data):
        '''Send ping frame to the remote end.'''
        if self.ws_connection is None:
            raise WebSocketClosedError()
        self.ws_connection.write_ping(data)

    def on_pong(self, data):
        '''Invoked when the response to a ping frame is received.'''
        pass


application = tornado.web.Application([
    tornado.web.url(r'/static/(.*)', tornado.web.StaticFileHandler, {'path': STATIC_PATH}),
    tornado.web.url(r'/web_da/(.*)', tornado.web.StaticFileHandler, {
            'path': WEB_DA_PATH,
            'default_filename': 'index.html',
        }),
    tornado.web.url(r'/$', MonitorHandler),
    tornado.web.url(r'/tree$', TreeHandler),
    tornado.web.url(r'/list_all$', MonitorHandler),
    tornado.web.url(r'/websocket', MyWebSocketHandler),
    tornado.web.url(r'/([^/]*)$', SessionHandler),
    tornado.web.url(r'/(.*)/(.*)$', DataHandler),
])


def broadcast_ec_host():
    import socket
    import time

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    # s.bind(('192.168.0.198', 17000))
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

    while True:
        try:
            logging('broadcast', 'to UDP port 17000')
            s.sendto(bytes('easyconnect', 'utf8'), ('<broadcast>', 17000))
        except Exception as e:
            logging('broadcast', 'Exception: {}'.format(e))

        time.sleep(1)

    logging('broadcast', 'Server shutdown')


def main():
    parser = argparse.ArgumentParser(description='Non-official CSM')
    parser.add_argument('-B', dest='no_broadcasting',
            action='store_true',
            help='No broadcasting')
    args = parser.parse_args()

    try:
        if not args.no_broadcasting:
            t = threading.Thread(target=broadcast_ec_host)
            t.daemon = True
            t.start()
        else:
            print('Start without broadcasting')

        application.listen(9999)
        setup_containers()
        tornado.ioloop.IOLoop.current().start()

    except KeyboardInterrupt:
        print('KeyboardInterrupt detected, shutdown')

if __name__ == '__main__':
    main()
