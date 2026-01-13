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
        success {
            script {
               emailext(
                    to: 'sarankumar@stepladdersolutions.com',
                    subject: "✅ Stepladder Solutions | Build Success - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    mimeType: 'text/html',
                    attachmentsPattern: attachments.join(','),
                    body: """
                    <html>
                    <body style="font-family: Arial, sans-serif; color:#333; background-color:#f4f6f8; padding:20px;">
                        <div style="max-width:800px; margin:auto; background:#ffffff; border:1px solid #ddd; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">

                            <!-- Header -->
                            <div style="background:#0d47a1; padding:18px 25px; text-align:center;">
                                <h2 style="color:#ffffff; margin:0;">Stepladder Solutions</h2>
                                <p style="color:#bbdefb; font-size:13px; margin:6px 0 0 0;">Automated CI/CD Build Report</p>
                            </div>

                            <!-- Body -->
                            <div style="padding:20px 25px;">
                                <h3 style="color:#2e7d32;">✅ Build Completed Successfully</h3>
                                <table style="width:100%; border-collapse:collapse; font-size:14px;">
                                    <tr><td style="padding:8px; width:180px;"><b>Project:</b></td><td style="padding:8px;">${env.JOB_NAME}</td></tr>
                                    <tr><td style="padding:8px;"><b>Branch:</b></td><td style="padding:8px;">dev</td></tr>
                                    <tr><td style="padding:8px;"><b>Build Number:</b></td><td style="padding:8px;">#${env.BUILD_NUMBER}</td></tr>
                                    <tr><td style="padding:8px;"><b>Status:</b></td><td style="padding:8px; color:green;"><b>SUCCESS</b></td></tr>
                                    <tr><td style="padding:8px;"><b>Build URL:</b></td><td style="padding:8px;"><a href="${env.BUILD_URL}" style="color:#1e88e5;">${env.BUILD_URL}</a></td></tr>
                                </table>

                                <div style="margin-top:18px; padding:14px; background:#f8f9fa; border:1px solid #ddd; border-radius:6px;">
                                    <p style="margin:0; font-size:13px;">📎 Attached Reports:</p>
                                    <ul style="font-size:13px; margin-top:6px;">
                                        <li>Extent Report - <b>result.html</b></li>
                                        <li>Surefire Report - <b>index.html</b></li>
                                        <li>AdeunQA Report - <b>AdeunQA.html</b></li>
                                    </ul>
                                    <p style="margin-top:10px; font-size:13px;">You can also view these under <b>HTML Reports</b> in Jenkins.</p>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="background:#f1f1f1; padding:12px; text-align:center;">
                                <p style="font-size:12px; color:#666; margin:0;">
                                    © ${Calendar.getInstance().get(Calendar.YEAR)} Stepladder Solutions | Jenkins CI Pipeline
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                )
            }
        }

        failure {
            emailext(
                to: 'sarankumar@stepladdersolutions.com',
                subject: "❌ Stepladder Solutions | Build Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                mimeType: 'text/html',
                body: """
                <html><body>
                <h3 style='color:red;'>Build Failed</h3>
                <p>Check Jenkins console output for details:</p>
                <a href="${env.BUILD_URL}" style="color:#1e88e5;">${env.BUILD_URL}</a>
                </body></html>
                """
            )
        }
    }
}
