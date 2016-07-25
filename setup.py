from setuptools import find_packages, setup
setup(
    name='test-csm',
    version='0.1',
    description='Non-official CSM',
    author='Cychih',
    author_email='michael66230@gmail.com',
    install_requires=['tornado'],
    packages=find_packages(exclude=['scripts']),
    package_data={
        '': ['*.py', 'static/*', 'html/*'],
    },
    scripts=['scripts/test-csm'],
)
