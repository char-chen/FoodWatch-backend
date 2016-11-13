module.exports = function(grunt) {

    grunt.initConfig({
        nodeEnv : process.env.NODE_ENV,
        afVersion : process.env.AF_VERSION,

        jshint: {
            options: {
                devel: true,
                sub: true, // turn off dot notation warning
                force: true,
                eqeqeq: true,
                ignores: ['test/']
            },
            all: ['Gruntfile.js', 'server.js', 'api.js']
        },
        shell : {
            nodeStart: {
                command: 'node server.js',
                options: {
                    stdout: true,
                    stderr: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // localhost
    grunt.registerTask('default', ['jshint']);

    // start server
    grunt.registerTask('serve', ['jshint', 'shell:nodeStart']);

    // TESTING
    grunt.registerTask('test', ['shell:prepareTest', 'shell:mochaTest']);
    grunt.registerTask('test-api', ['shell:prepareTest', 'shell:mochaTestRestApi']);
    grunt.registerTask('test-unit', ['shell:mochaTestServerUnit']);
};