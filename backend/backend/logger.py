import logging.config

from gunicorn import glogging

logging_cfg = {
		'version': 1,
		'disable_existing_loggers': False,
		'formatters': {
			'KeyValueFormatter': {
				'format': (
					'%(asctime)s '
					'[%(levelname)s] message=%(message)s'
				)
			},
		},
		'handlers': {
			'console': {
				'level': 'DEBUG',
				'class': 'logging.StreamHandler',
				'formatter': 'KeyValueFormatter',
			}
		},
		'loggers': {
			'gunicorn.access': {
                'level': 'DEBUG', # 'INFO' -> 'DEBUG
				'propagate': True,
			},
			'gunicorn.error': {
                'level': 'DEBUG', # 'INFO' -> 'DEBUG
				'propagate': True,
			},
		},
		'root': {
			'level': 'DEBUG',
			'handlers': ['console'],
		}
}


logger = logging.getLogger(__name__)

def get_result():
    logger.info('Calculating result')
    return b'Hello world!'

def wsgi_app(environ, start_response):
    result = get_result()
    start_response('200 OK', [('Content-Type', 'text/html')])
    return [result]

def configure_logging():
    logging.config.dictConfig(logging_cfg)

class UniformLogger(glogging.Logger):

    def setup(self, cfg):
        configure_logging()


if __name__ == '__main__':
    configure_logging()
    print(get_result())