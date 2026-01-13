pipeline {
    agent any

    tools {
        nodejs 'Node18'
    }

    environment {
        PROJECT_NAME = 'Playwright JS Automation'
        REPORT_URL   = "${env.BUILD_URL}Playwright_HTML_Report"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Node & NPM') {
            steps {
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                bat 'npx playwright install'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                bat 'npx playwright test'
            }
        }

        stage('Publish Test Results') {
            steps {
                // JUnit XML report
                junit 'results/test-results.xml'

                // Playwright HTML report
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright_HTML_Report'
                ])
            }
        }
    }

    post {

        always {
            echo 'Pipeline execution completed'
        }

        success {
            emailext(
                subject: "SUCCESS: ${PROJECT_NAME} - Build #${BUILD_NUMBER}",
                mimeType: 'text/html',
                body: """
                <h2 style="color:green;">Build SUCCESS</h2>
                <p><b>Project:</b> ${PROJECT_NAME}</p>
                <p><b>Build Number:</b> ${BUILD_NUMBER}</p>
                <p><b>HTML Report:</b>
                <a href="${REPORT_URL}">View Report</a></p>
                <p><b>Build URL:</b>
                <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                """,
                to: 'sarankumar@stepladdersolutions.com'
            )
        }

        failure {
            emailext(
                subject: "FAILURE: ${PROJECT_NAME} - Build #${BUILD_NUMBER}",
                mimeType: 'text/html',
                body: """
                <h2 style="color:red;">Build FAILED</h2>
                <p><b>Project:</b> ${PROJECT_NAME}</p>
                <p><b>Build Number:</b> ${BUILD_NUMBER}</p>
                <p><b>Console Logs:</b>
                <a href="${BUILD_URL}console">${BUILD_URL}console</a></p>
                """,
                to: 'sarankumar@stepladdersolutions.com'
            )
        }
    }
}

