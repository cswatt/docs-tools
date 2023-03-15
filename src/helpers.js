const yaml = require('js-yaml');

const parseInput = (input) => {
    var result = [];
    let inputBlob = yaml.load(input)
    let content = inputBlob[1]["data"]
    for (const org in content){

        let repos = content[org]['repos']

        for (const repo in repos){
            let actions = content[org]['repos'][repo]['contents']
            for (const action in actions){
                
                let entry = new Object();
                entry['org_name'] = content[org]['org_name']
                entry['repo_name'] = repos[repo]['repo_name']
                entry['action'] = actions[action]['action']
                entry['branch'] = actions[action]['branch']
                entry['globs'] = actions[action]['globs']
                entry['options'] = actions[action]['options']
                result.push(entry)
            }
        }
        
    }
    return result
}

const parseOutput = (input) => {
    let data = []
    let orgs = new Map();
    for (const i in input) {
        let org_name = input[i]['org_name']
        if (!orgs.has(org_name)){
            let repos = new Map();
            orgs.set(org_name, repos)
        }
        let repos = orgs.get(org_name)
        let repo_name = input[i]['repo_name']
        if (!repos.has(repo_name)){
            let actions = new Map();
            repos.set(repo_name, [])
        }
        let action = input[i]
        let actions = repos.get(repo_name)
        actions.push(action)
        repos.set(repo_name, actions)
        orgs.set(org_name, repos)
    }

    for (let [k, v] of orgs){
        let repos = []
        for (let [_k, _v] of v){
            let actions = []
            for (let i in _v){
                let action = {
                            "action" : _v[i]["action"],
                            "branch" : _v[i]["branch"],
                            "globs" : _v[i]["globs"],
                            "options": _v[i]["options"]
                }
                actions.push(action)
            }
            let repo = {
                        "repo_name": _k,
                        "contents": actions
            }
            repos.push(repo)
        }
        let org = {
                    "org_name": k,
                    "repos": repos
        }
        data.push(org)
    }
    const output = [{"config": {"cache_enabled": true}}, {"data":data}]
    return yaml.dump(output)
}

const parseOptions = (action, input) => {
    let options = new Object();
    if (action==='pull-and-push-file'){

        // get a from url
        try {
            options['from_url'] = input['front_matters']['dependencies']
        } catch (error) {
            options['from_url'] = ""
        }


        // get a to url
        try {
            if (input['file_name']==='_index.md'){
                options['to_url'] = "http://docs.datadoghq.com" + input['dest_path']
            } else if (input['file_name'].includes('.md')){
                options['to_url'] = "http://docs.datadoghq.com" + input['dest_path'] + input['file_name'].substring(0, input['file_name'].length-3)
            }
        } catch (error) {
            options['to_url'] = ""
        }

        // get a to string
        try{
            options['to_string'] = input['dest_path']+input['file_name']
        } catch (error) {
            options['to_string'] = ""
            // console.log(options)
        }
    }
    if (action==='npm-integrations'){
        
    }
    return options
    
}

const DEFAULT =`---
- config:
    cache_enabled: true

- data:
    - org_name: jenkinsci

      repos:
      - repo_name: datadog-plugin

        contents:

        - action: pull-and-push-file
          branch: master
          globs:
          - README.md
          options:
            dest_path: '/integrations/'
            file_name: 'jenkins.md'
            front_matters:
              dependencies: ["https://github.com/jenkinsci/datadog-plugin/blob/master/README.md"]
              public_title: Datadog-Jenkins Integration
              kind: integration
              name: jenkins
              is_public: true
              integration_title: Jenkins
              has_logo: true
              git_integration_title: jenkins
              description: "Automatically forward your Jenkins metrics, events, and service checks to Datadog."
              short_description: "Automatically forward your Jenkins metrics, events, and service checks to Datadog."
              categories:
                - "configuration & deployment"
              doc_link: https://docs.datadoghq.com/integrations/jenkins/

    - org_name: aws

      repos:
      - repo_name: aws-sdk-go

        contents:

        - action: npm-integrations
          branch: main
          globs:
          # https://github.com/aws/aws-sdk-go/blob/main/aws/endpoints/defaults.go
          - aws/endpoints/defaults.go

    - org_name: DataDog

      repos:
      - repo_name: dd-go

        contents:

        - action: npm-integrations
          branch: prod
          globs:
          # https://github.com/DataDog/dd-go/blob/prod/networks/model/domain/gcp_services.go
          - networks/model/domain/gcp_services.go
          # https://github.com/DataDog/dd-go/blob/prod/networks/model/domain/azure_services.go
          - networks/model/domain/azure_services.go

      - repo_name: dogweb

        contents:

        - action: integrations
          branch: prod
          globs:
          - integration/*/*_metadata.csv
          - integration/*/manifest.json
          - integration/*/service_checks.json
          - integration/*/README.md
          - integration/*/__init__.py

      - repo_name: integrations-core
        contents:

        - action: integrations
          branch: master
          globs:
          - "*/metadata.csv"
          - "*/manifest.json"
          - "*/assets/service_checks.json"
          - "*/README.md"
          - "*/datadog_checks/*/__about__.py"

        - action: pull-and-push-folder
          branch: master
          globs:
          - docs/dev/*.md
          options:
            dest_dir: '/developers/integrations/'
            path_to_remove: 'docs/dev/'
            front_matters:
              dependencies: [ "https://github.com/DataDog/integrations-core/blob/master/docs/dev/" ]

      - repo_name: integrations-extras
        contents:

        - action: integrations
          branch: master
          globs:
          - "*/metadata.csv"
          - "*/manifest.json"
          - "*/assets/service_checks.json"
          - "*/README.md"
          - "*/datadog_checks/*/__about__.py"

      - repo_name: integrations-internal-core
        contents:

        - action: integrations
          branch: main
          globs:
          - "*/metadata.csv"
          - "*/manifest.json"
          - "*/assets/service_checks.json"
          - "*/README.md"
          - "*/datadog_checks/*/__about__.py"

      - repo_name: marketplace
        contents:

        - action: marketplace-integrations
          branch: master
          globs:
          - "*/metadata.csv"
          - "*/manifest.json"
          - "*/assets/service_checks.json"
          - "*/README.md"
          - "*/images/*.png"
          - "*/images/*.jpg"
          - "*/images/*.jpeg"
          - "*/images/*.svg"

      - repo_name: ansible-datadog
        contents:

        - action: pull-and-push-file
          branch: main
          globs:
          - README.md
          options:
            dest_path: '/agent/basic_agent_usage/'
            file_name: 'ansible.md'
            front_matters:
              title: Ansible
              kind: documentation
              dependencies: ["https://github.com/DataDog/ansible-datadog/blob/main/README.md"]

      - repo_name: chef-datadog
        contents:

        - action: pull-and-push-file
          branch: main
          globs:
          - README.md
          options:
            dest_path: '/agent/basic_agent_usage/'
            file_name: 'chef.md'
            front_matters:
              title: Chef
              kind: documentation
              dependencies: ["https://github.com/DataDog/chef-datadog/blob/main/README.md"]

      - repo_name: heroku-buildpack-datadog
        contents:

        - action: pull-and-push-file
          branch: master
          globs:
          - README.md
          options:
            dest_path: '/agent/basic_agent_usage/'
            file_name: 'heroku.md'
            front_matters:
              title: Datadog Heroku Buildpack
              kind: documentation
              dependencies: ["https://github.com/DataDog/heroku-buildpack-datadog/blob/master/README.md"]
              aliases:
              - /developers/faq/how-do-i-collect-metrics-from-heroku-with-datadog

      - repo_name: puppet-datadog-agent
        contents:

        - action: pull-and-push-file
          branch: main
          globs:
          - README.md
          options:
            dest_path: '/agent/basic_agent_usage/'
            file_name: 'puppet.md'
            front_matters:
              title: Puppet
              kind: documentation
              dependencies: ["https://github.com/DataDog/puppet-datadog-agent/blob/main/README.md"]

      - repo_name: datadog-formula
        contents:

        - action: pull-and-push-file
          branch: main
          globs:
          - README.md
          options:
            dest_path: '/agent/basic_agent_usage/'
            file_name: 'saltstack.md'
            front_matters:
              title: SaltStack
              kind: documentation
              dependencies: ["https://github.com/DataDog/datadog-formula/blob/main/README.md"]

      - repo_name: dd-trace-rb
        contents:
        - action: pull-and-push-file
          branch: release
          globs:
          - 'docs/GettingStarted.md'
          options:
            dest_path: '/tracing/trace_collection/dd_libraries/'
            file_name: 'ruby.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/dd-trace-rb/blob/release/docs/GettingStarted.md"]
              title: Tracing Ruby Applications
              kind: documentation
              code_lang: ruby
              type: multi-code-lang
              code_lang_weight: 15
              aliases:
              - /tracing/ruby/
              - /tracing/languages/ruby/
              - /tracing/setup/ruby/
              - /tracing/setup_overview/ruby/
              - /agent/apm/ruby/
              - /tracing/setup_overview/setup/ruby
              - /tracing/trace_collection/ruby

      - repo_name: datadog-serverless-functions
        contents:
        - action: pull-and-push-file
          branch: master
          globs:
          - 'aws/logs_monitoring/README.md'
          options:
            dest_path: '/logs/guide/'
            file_name: 'forwarder.md'
            # front_matters:
            #   dependencies: ["https://github.com/DataDog/datadog-serverless-functions/blob/master/aws/logs_monitoring/README.md"]

      - repo_name: serverless-plugin-datadog
        contents:
        - action: pull-and-push-file
          branch: master
          globs:
          - 'README.md'
          options:
            dest_path: '/serverless/libraries_integrations/'
            file_name: 'plugin.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/serverless-plugin-datadog/blob/master/README.md"]
              title: Datadog Serverless Framework Plugin
              kind: documentation
              aliases:
              - /serverless/serverless_integrations/plugin

      - repo_name: datadog-cloudformation-macro
        contents:
        - action: pull-and-push-file
          branch: master
          globs:
          - 'serverless/README.md'
          options:
            dest_path: '/serverless/libraries_integrations/'
            file_name: 'macro.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/datadog-cloudformation-macro/blob/master/serverless/README.md"]
              title: Datadog Serverless Macro
              kind: documentation
              aliases:
                - /serverless/serverless_integrations/macro/

      - repo_name: datadog-ci
        contents:
        - action: pull-and-push-file
          branch: master
          globs:
          - 'src/commands/lambda/README.md'
          options:
            dest_path: '/serverless/libraries_integrations/'
            file_name: 'cli.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/datadog-ci/blob/master/src/commands/lambda/README.md"]
              title: Datadog Serverless CLI
              kind: documentation
              aliases:
                - /serverless/datadog_lambda_library/
                - /serverless/serverless_integrations/cli/
        - action: pull-and-push-file
          branch: master
          globs:
          - 'src/commands/synthetics/README.md'
          options:
            dest_path: '/continuous_testing/cicd_integrations/'
            file_name: 'configuration.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/datadog-ci/blob/master/src/commands/synthetics/README.md"]
              title: Continuous Testing and CI/CD Configuration
              kind: documentation
              description: Configure Continuous Testing to run tests in your CI/CD pipelines.
              aliases:
                - /synthetics/cicd_integrations/configuration
              further_reading:
              - link: "https://www.datadoghq.com/blog/datadog-github-action-synthetics-ci-visibility/"
                tag: "Blog"
                text: "Use Datadog's GitHub Action to add continuous testing to workflows"
              - link: "/continuous_testing/cicd_integrations"
                tag: "Documentation"
                text: "Learn about Continuous Testing and CI/CD"
              - link: "/continuous_testing/explorer"
                tag: "Documentation"
                text: "Learn about the CI Results Explorer"
              - link: "/continuous_testing/testing_tunnel"
                tag: "Documentation"
                text: "Learn about the Testing Tunnel"

      - repo_name: datadog-cdk-constructs
        contents:
        - action: pull-and-push-file
          branch: main
          globs:
          - 'README.md'
          options:
            dest_path: '/serverless/libraries_integrations/'
            file_name: 'cdk.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/datadog-cdk-constructs/blob/main/README.md"]
              title: Datadog CDK Construct
              kind: documentation

      - repo_name: datadog-lambda-extension
        contents:
        - action: pull-and-push-file
          branch: main
          globs:
          - 'README.md'
          options:
            dest_path: '/serverless/libraries_integrations/'
            file_name: 'extension.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/datadog-lambda-extension/blob/main/README.md"]
              title: Datadog Lambda Extension
              kind: documentation
              aliases:
                - /serverless/datadog_lambda_library/extension

      - repo_name: datadog-ci-azure-devops
        contents:
        - action: pull-and-push-file
          branch: main
          globs:
          - 'README.md'
          options:
            dest_path: '/continuous_testing/cicd_integrations/'
            file_name: 'azure_devops_extension.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/datadog-ci-azure-devops/blob/main/README.md"]
              title: Continuous Testing and Datadog CI Azure DevOps Extension
              kind: documentation
              description: Use the Synthetics and Datadog CI extension to create tasks that you can use in a CI pipeline.
              aliases:
                - /synthetics/cicd_integrations/azure_devops_extension

      - repo_name: synthetics-ci-github-action
        contents:
        - action: pull-and-push-file
          branch: main
          globs:
          - 'README.md'
          options:
            dest_path: '/continuous_testing/cicd_integrations/'
            file_name: 'github_actions.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/synthetics-ci-github-action/blob/main/README.md"]
              title: Continuous Testing and GitHub Actions
              kind: documentation
              aliases:
                - /synthetics/cicd_integrations/github_actions

      - repo_name: synthetics-ci-orb
        contents:
        - action: pull-and-push-file
          branch: main
          globs:
          - 'README.md'
          options:
            dest_path: '/continuous_testing/cicd_integrations/'
            file_name: 'circleci_orb.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/synthetics-ci-orb/blob/main/README.md"]
              title: Continuous Testing and CircleCI Orb
              kind: documentation
              aliases:
                - /synthetics/cicd_integrations/circleci_orb

      - repo_name: dd-sdk-android
        contents:
        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/rum_getting_started.md'
          options:
            dest_path: '/real_user_monitoring/android/'
            file_name: '_index.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/dd-sdk-android/blob/master/docs/rum_getting_started.md"]
              title: RUM Android and Android TV Monitoring
              kind: documentation
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-android"
                  tag: "Github"
                  text: "dd-sdk-android Source code"
                - link: "/real_user_monitoring"
                  tag: "Documentation"
                  text: "Explore Datadog RUM"
        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/mobile_data_collected.md'
          options:
            dest_path: '/real_user_monitoring/android/'
            file_name: 'data_collected.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/dd-sdk-android/blob/master/docs/mobile_data_collected.md"]
              title: RUM Android Data Collected
              kind: documentation
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-android"
                  tag: "GitHub"
                  text: "dd-sdk-android Source code"
                - link: "/real_user_monitoring"
                  tag: "Documentation"
                  text: "Explore Datadog RUM"
        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/configure_rum_android_sdk.md'
          options:
            dest_path: '/real_user_monitoring/android/'
            file_name: 'advanced_configuration.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/dd-sdk-android/blob/master/docs/configure_rum_android_sdk.md"]
              title: RUM Android Advanced Configuration
              kind: documentation
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-android"
                  tag: "GitHub"
                  text: "dd-sdk-android Source code"
                - link: "/real_user_monitoring"
                  tag: "Documentation"
                  text: "Explore Datadog RUM"
        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/rum_mobile_vitals.md'
          options:
            dest_path: '/real_user_monitoring/android/'
            file_name: 'mobile_vitals.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/dd-sdk-android/blob/master/docs/rum_mobile_vitals.md"]
              title: Mobile Vitals
              description: Discover insights about your iOS application's health and performance.
              kind: documentation
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-android"
                  tag: "GitHub"
                  text: "dd-sdk-android Source code"
                - link: "https://www.datadoghq.com/blog/monitor-mobile-vitals-datadog/"
                  tag: "Blog"
                  text: "Monitor Mobile Vitals in Datadog"
        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/web_view_tracking.md'
          options:
            dest_path: '/real_user_monitoring/android/'
            file_name: 'web_view_tracking.md'
        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/integrated_libraries_android.md'
          options:
            dest_path: '/real_user_monitoring/android/'
            file_name: 'integrated_libraries.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/dd-sdk-android/blob/master/docs/integrated_libraries_android.md"]
              title: Android Integrated Libraries
              kind: documentation
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-android"
                  tag: "GitHub"
                  text: "dd-sdk-android Source code"
                - link: "/real_user_monitoring"
                  tag: "Documentation"
                  text: "Explore Datadog RUM"
        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/troubleshooting_android.md'
          options:
            dest_path: '/real_user_monitoring/android/'
            file_name: 'troubleshooting.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/dd-sdk-android/blob/master/docs/troubleshooting_android.md"]
              title: Troubleshooting
              kind: documentation
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-android"
                  tag: "GitHub"
                  text: "dd-sdk-android Source code"
                - link: "/real_user_monitoring"
                  tag: "Documentation"
                  text: "Explore Real User Monitoring"
      - repo_name: browser-sdk
        contents:
        - action: pull-and-push-file
          branch: main
          globs:
          - 'packages/rum/README.md'
          options:
            dest_path: '/real_user_monitoring/browser/'
            file_name: '_index.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/browser-sdk/blob/main/packages/rum/README.md"]
              title: RUM Browser Monitoring
              kind: documentation
              aliases:
                - /real_user_monitoring/setup
              further_reading:
                - link: '/real_user_monitoring/explorer/'
                  tag: 'Documentation'
                  text: 'Learn about the RUM Explorer'
                - link: '/logs/log_collection/javascript/'
                  tag: 'Documentation'
                  text: 'Learn about the Datadog Browser SDK for Logs'
        - action: pull-and-push-file
          branch: main
          globs:
          - 'packages/logs/README.md'
          options:
            dest_path: '/logs/log_collection/'
            file_name: 'javascript.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/browser-sdk/blob/main/packages/logs/README.md"]
              title: Browser Log Collection
              kind: documentation
              aliases:
              - /logs/log_collection/web_browser
      - repo_name: dd-sdk-android-gradle-plugin
        contents:
        - action: pull-and-push-file
          branch: main
          globs:
          - 'docs/upload_mapping_file.md'
          options:
            dest_path: '/real_user_monitoring/error_tracking/'
            file_name: 'android.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/dd-sdk-android-gradle-plugin/blob/main/docs/upload_mapping_file.md"]
              title: Android Crash Reporting and Error Tracking
              kind: documentation
              further_reading:
              - link: 'https://www.datadoghq.com/blog/debug-android-crashes/'
                tag: 'Blog'
                text: 'Debug Android crashes faster with Datadog'
              - link: '/real_user_monitoring/error_tracking/'
                tag: 'Documentation'
                text: 'Learn about Error Tracking'
              - link: '/real_user_monitoring/error_tracking/explorer'
                tag: 'Documentation'
                text: 'Visualize Error Tracking data in the RUM Explorer'
      - repo_name: datadog-cloudformation-resources
        contents:
        - action: pull-and-push-file
          branch: master
          globs:
          - 'README.md'
          options:
            dest_path: '/integrations/guide/'
            file_name: 'amazon_cloudformation.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/datadog-cloudformation-resources/blob/master/README.md"]
              title: Datadog-Amazon CloudFormation
              kind: documentation
              aliases:
                - /developers/amazon_cloudformation/

      - repo_name: dd-sdk-android
        contents:
        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/log_collection.md'
          options:
            dest_path: '/logs/log_collection/'
            file_name: 'android.md'
            front_matters:
              title: Android Log Collection
              kind: documentation
              description: "Collect logs from your Android applications."
              dependencies: ["https://github.com/DataDog/dd-sdk-android/blob/master/docs/log_collection.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-android"
                  tag: "GitHub"
                  text: "dd-sdk-android Source code"
                - link: "logs/explorer"
                  tag: "Documentation"
                  text: "Learn how to explore your logs"

        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/trace_collection.md'
          options:
            dest_path: '/tracing/trace_collection/dd_libraries/'
            file_name: 'android.md'
            front_matters:
              title: Android Trace Collection
              kind: documentation
              aliases:
                - /tracing/setup_overview/setup/android
                - /tracing/setup/android
              description: "Collect traces from your Android applications."
              dependencies: ["https://github.com/DataDog/dd-sdk-android/blob/master/docs/trace_collection.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-android"
                  tag: "GitHub"
                  text: "dd-sdk-android Source code"
                - link: "tracing/visualization/"
                  tag: "Documentation"
                  text: "Explore your services, resources, and traces"

      - repo_name: dd-sdk-ios
        contents:
        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/rum_collection/_index.md'
          options:
            dest_path: '/real_user_monitoring/ios/'
            file_name: '_index.md'
            front_matters:
              title: RUM iOS and tvOS Monitoring
              kind: documentation
              description: "Collect RUM data from your iOS projects."
              dependencies: ["https://github.com/DataDog/dd-sdk-ios/blob/master/docs/rum_collection/_index.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-ios"
                  tag: "GitHub"
                  text: "dd-sdk-ios Source code"
                - link: "real_user_monitoring/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your RUM data"

        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/log_collection.md'
          options:
            dest_path: '/logs/log_collection/'
            file_name: 'ios.md'
            front_matters:
              title: iOS Log Collection
              kind: documentation
              description: "Collect logs from your iOS applications."
              dependencies: ["https://github.com/DataDog/dd-sdk-ios/blob/master/docs/log_collection.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-ios"
                  tag: "GitHub"
                  text: "dd-sdk-ios Source code"
                - link: "logs/explorer"
                  tag: "Documentation"
                  text: "Learn how to explore your logs"

        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/trace_collection.md'
          options:
            dest_path: '/tracing/trace_collection/dd_libraries/'
            file_name: 'ios.md'
            front_matters:
              title: iOS Trace Collection
              kind: documentation
              aliases:
                - /tracing/setup_overview/setup/ios/
                - /tracing/setup/ios/
              description: "Collect traces from your iOS applications."
              dependencies: ["https://github.com/DataDog/dd-sdk-ios/blob/master/docs/trace_collection.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-ios"
                  tag: "GitHub"
                  text: "dd-sdk-ios Source code"
                - link: "tracing/visualization/"
                  tag: "Documentation"
                  text: "Explore your services, resources, and traces"

        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/rum_mobile_vitals.md'
          options:
            dest_path: '/real_user_monitoring/ios/'
            file_name: 'mobile_vitals.md'
            front_matters:
              title: Mobile Vitals
              kind: documentation
              description: "Collect RUM data from your iOS projects."
              dependencies: ["https://github.com/DataDog/dd-sdk-ios/blob/master/docs/rum_mobile_vitals.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-ios"
                  tag: "GitHub"
                  text: "dd-sdk-ios Source code"
                - link: "real_user_monitoring/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your RUM data"

        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/rum_collection/crash_reporting.md'
          options:
            dest_path: '/real_user_monitoring/error_tracking/'
            file_name: 'ios.md'
            front_matters:
              title: iOS Crash Reporting and Error Tracking
              kind: documentation
              description: "Set up Error Tracking for your iOS projects."
              dependencies: ["https://github.com/DataDog/dd-sdk-ios/blob/master/docs/rum_collection/crash_reporting.md"]
              aliases:
                - /real_user_monitoring/ios/crash_reporting/
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-ios"
                  tag: "GitHub"
                  text: "dd-sdk-ios Source code"
                - link: "https://datadoghq.com/blog/ios-crash-reporting-datadog/"
                  tag: "Blog"
                  text: "Introducing iOS Crash Reporting and Error Tracking"
                - link: "real_user_monitoring/error_tracking/"
                  tag: "Documentation"
                  text: "Learn about Error Tracking"

        - action: pull-and-push-file
          branch: master
          globs:
          - 'docs/rum_collection/swiftui.md'
          options:
            dest_path: '/real_user_monitoring/ios/'
            file_name: 'swiftui.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/dd-sdk-ios/blob/master/docs/rum_collection/swiftui.md"]

        - action: pull-and-push-folder
          branch: master
          globs:
            - docs/rum_collection/*
          options:
            dest_dir: '/real_user_monitoring/ios/'
            path_to_remove: 'docs/rum_collection/'
            front_matters:
              dependencies: [ "https://github.com/DataDog/dd-sdk-ios/blob/master/docs/rum_collection/" ]

      - repo_name: dd-sdk-reactnative
        contents:
        - action: pull-and-push-file
          branch: main
          globs:
          - 'README.md'
          options:
            dest_path: '/real_user_monitoring/reactnative/'
            file_name: '_index.md'
            front_matters:
              title: React Native Monitoring
              kind: documentation
              description: "Collect RUM data from your React Native projects."
              dependencies: ["https://github.com/DataDog/dd-sdk-reactnative/blob/main/README.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-reactnative"
                  tag: "GitHub"
                  text: "dd-sdk-reactnative Source code"
                - link: "https://www.datadoghq.com/blog/react-native-monitoring/"
                  tag: "Blog"
                  text: "Monitor React Native applications"
                - link: "real_user_monitoring/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your RUM data"
        - action: pull-and-push-file
          branch: main
          globs:
          - 'docs/advanced_configuration.md'
          options:
            dest_path: '/real_user_monitoring/reactnative/'
            file_name: 'advanced_configuration.md'
            front_matters:
              title: RUM React Native Advanced Configuration
              kind: documentation
              description: Learn about advanced configuration options for your React Native setup.
              dependencies: ["https://github.com/DataDog/dd-sdk-reactnative/blob/main/docs/advanced_configuration.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-reactnative"
                  tag: "GitHub"
                  text: "dd-sdk-reactnative Source code"
                - link: "real_user_monitoring/reactnative/"
                  tag: "Documentation"
                  text: "Learn about React Native Monitoring"
        - action: pull-and-push-file
          branch: main
          globs:
          - 'docs/rum_integrations.md'
          options:
            dest_path: '/real_user_monitoring/reactnative/'
            file_name: 'integrated_libraries.md'
            front_matters:
              title: React Native Integrated Libraries
              kind: faq
              description: "Collect RUM data from your React Native projects."
              dependencies: ["https://github.com/DataDog/dd-sdk-reactnative/blob/main/docs/rum_integrations.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-reactnative"
                  tag: "GitHub"
                  text: "dd-sdk-reactnative Source code"
                - link: "https://www.datadoghq.com/blog/react-native-monitoring/"
                  tag: "Blog"
                  text: "Monitor your React Native applications"
                - link: "real_user_monitoring/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your RUM data"
        - action: pull-and-push-file
          branch: main
          globs:
          - 'docs/rum_mobile_vitals.md'
          options:
            dest_path: '/real_user_monitoring/reactnative/'
            file_name: 'mobile_vitals.md'
            front_matters:
              title: Mobile Vitals
              kind: documentation
              description: "Collect RUM data from your React Native projects."
              dependencies: ["https://github.com/DataDog/dd-sdk-reactnative/blob/main/docs/rum_mobile_vitals.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-reactnative"
                  tag: "GitHub"
                  text: "dd-sdk-reactnative Source code"
                - link: "real_user_monitoring/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your RUM data"
                - link: "https://www.datadoghq.com/blog/react-native-monitoring/"
                  tag: "Blog"
                  text: "Monitor your React Native applications"
        - action: pull-and-push-file
          branch: main
          globs:
          - 'docs/expo_development.md'
          options:
            dest_path: '/real_user_monitoring/reactnative/'
            file_name: 'expo.md'
            front_matters:
              title: Expo
              kind: documentation
              description: "Monitor your React Native projects using Expo and Expo Go with Datadog."
              dependencies: ["https://github.com/DataDog/dd-sdk-reactnative/blob/main/docs/expo_development.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-reactnative"
                  tag: "GitHub"
                  text: "dd-sdk-reactnative Source code"
                - link: "real_user_monitoring/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your RUM data"

        - action: pull-and-push-file
          branch: main
          globs:
          - 'docs/codepush.md'
          options:
            dest_path: '/real_user_monitoring/reactnative/'
            file_name: 'codepush.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/dd-sdk-reactnative/blob/main/docs/codepush.md"]
              title: CodePush
              kind: documentation
              description: 'Learn how to use a client-side React Native module to interact with Appcenter Codepush and Datadog.'
              further_reading:
                - link: 'https://github.com/DataDog/dd-sdk-reactnative'
                  tag: 'GitHub'
                  text: 'dd-sdk-reactnative Source code'
                - link: 'real_user_monitoring/reactnative/'
                  tag: 'Documentation'
                  text: "Learn about React Native Monitoring"

        - action: pull-and-push-file
          branch: main
          globs:
          - 'docs/expo_crash_reporting.md'
          options:
            dest_path: '/real_user_monitoring/error_tracking/'
            file_name: 'expo.md'
            front_matters:
              dependencies: ["https://github.com/DataDog/dd-sdk-reactnative/blob/main/docs/expo_crash_reporting.md"]
              title: Expo Crash Reporting and Error Tracking
              kind: documentation
              description: Capture Expo crash reports in Datadog.
              further_reading:
              - link: 'https://www.datadoghq.com/blog/debug-android-crashes/'
                tag: 'Blog'
                text: 'Debug Android crashes faster with Datadog'
              - link: 'https://www.datadoghq.com/blog/ios-crash-reporting-datadog/'
                tag: 'Blog'
                text: 'Debug iOS crashes efficiently with Datadog'
              - link: '/real_user_monitoring/error_tracking/'
                tag: 'Documentation'
                text: 'Learn about Error Tracking'
              - link: '/real_user_monitoring/error_tracking/explorer'
                tag: 'Documentation'
                text: 'Visualize Error Tracking data in the RUM Explorer'
        - action: pull-and-push-file
          branch: main
          globs:
          - 'docs/crash_reporting.md'
          options:
            dest_path: '/real_user_monitoring/error_tracking/'
            file_name: 'reactnative.md'
            front_matters:
              title: React Native Crash Reporting and Error Tracking
              kind: documentation
              description: Set up Error Tracking for your React Native projects.
              dependencies: ["https://github.com/DataDog/dd-sdk-reactnative/blob/main/docs/crash_reporting.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-reactnative"
                  tag: "GitHub"
                  text: "dd-sdk-reactnative Source code"
                - link: "real_user_monitoring/error_tracking/"
                  tag: "Documentation"
                  text: "Learn about Error Tracking"
                - link: "https://www.datadoghq.com/blog/rum-now-offers-react-native-crash-reporting-and-error-tracking/"
                  tag: "Blog"
                  text: "RUM now offers React Native Crash Reporting and Error Tracking"

      - repo_name: dd-sdk-flutter
        contents:
        - action: pull-and-push-file
          branch: main
          globs:
          - 'packages/datadog_flutter_plugin/doc/rum/rum_collection.md'
          options:
            dest_path: '/real_user_monitoring/flutter/'
            file_name: '_index.md'
            front_matters:
              title: Flutter Monitoring
              kind: documentation
              description: "Collect RUM data from your Flutter projects."
              dependencies: ["https://github.com/DataDog/dd-sdk-flutter/blob/main/packages/datadog_flutter_plugin/doc/rum/rum_collection.md"]
              further_reading:
                - link: "https://www.datadoghq.com/blog/monitor-flutter-application-performance-with-mobile-rum/"
                  tag: "Blog"
                  text: "Monitor Flutter application performance with Datadog Mobile RUM"
                - link: "https://github.com/DataDog/dd-sdk-flutter"
                  tag: "GitHub"
                  text: "dd-sdk-flutter Source code"
                - link: "real_user_monitoring/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your RUM data"
        - action: pull-and-push-file
          branch: main
          globs:
          - 'packages/datadog_flutter_plugin/doc/log_collection.md'
          options:
            dest_path: '/logs/log_collection/'
            file_name: 'flutter.md'
            front_matters:
              title: Flutter Log Collection
              kind: documentation
              description: "Collect Logs data from your Flutter projects."
              dependencies: ["https://github.com/DataDog/dd-sdk-flutter/blob/main/packages/datadog_flutter_plugin/doc/log_collection.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-flutter"
                  tag: "GitHub"
                  text: "dd-sdk-flutter Source code"
                - link: "logs/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your logs"
        - action: pull-and-push-file
          branch: main
          globs:
          - 'packages/datadog_flutter_plugin/doc/common_setup.md'
          options:
            dest_path: '/real_user_monitoring/flutter/'
            file_name: 'setup.md'
            front_matters:
              title: Setup
              kind: documentation
              description: "Setup Flutter Monitoring for RUM & Session Replay or Log Management."
              dependencies: ["https://github.com/DataDog/dd-sdk-flutter/blob/main/packages/datadog_flutter_plugin/doc/common_setup.md"]
              further_reading:
                - link: "https://www.datadoghq.com/blog/monitor-flutter-application-performance-with-mobile-rum/"
                  tag: "Blog"
                  text: "Monitor Flutter application performance with Datadog Mobile RUM"
                - link: "https://github.com/DataDog/dd-sdk-flutter"
                  tag: "GitHub"
                  text: "dd-sdk-flutter Source code"
                - link: "real_user_monitoring/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your RUM data"
        - action: pull-and-push-file
          branch: main
          globs:
          - 'packages/datadog_flutter_plugin/doc/rum/advanced_configuration.md'
          options:
            dest_path: '/real_user_monitoring/flutter/'
            file_name: 'advanced_configuration.md'
            front_matters:
              title: RUM Flutter Advanced Configuration
              kind: documentation
              description: "Learn how to configure Flutter Monitoring."
              dependencies: ["https://github.com/DataDog/dd-sdk-flutter/blob/main/packages/datadog_flutter_plugin/doc/rum/advanced_configuration.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-flutter"
                  tag: "GitHub"
                  text: "dd-sdk-flutter Source code"
                - link: "real_user_monitoring/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your RUM data"
        - action: pull-and-push-file
          branch: main
          globs:
          - 'packages/datadog_flutter_plugin/doc/rum/data_collected.md'
          options:
            dest_path: '/real_user_monitoring/flutter/'
            file_name: 'data_collected.md'
            front_matters:
              title: RUM Flutter Data Collected
              kind: documentation
              description: "Learn about the data collected by Flutter Monitoring."
              dependencies: ["https://github.com/DataDog/dd-sdk-flutter/blob/main/packages/datadog_flutter_plugin/doc/rum/data_collected.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-flutter"
                  tag: "GitHub"
                  text: "dd-sdk-flutter Source code"
                - link: "real_user_monitoring/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your RUM data"
        - action: pull-and-push-file
          branch: main
          globs:
          - 'packages/datadog_flutter_plugin/doc/rum/mobile_vitals.md'
          options:
            dest_path: '/real_user_monitoring/flutter/'
            file_name: 'mobile_vitals.md'
            front_matters:
              title: Mobile Vitals
              kind: documentation
              description: "Learn about mobile vitals collected by Flutter Monitoring."
              dependencies: ["https://github.com/DataDog/dd-sdk-flutter/blob/main/packages/datadog_flutter_plugin/doc/rum/mobile_vitals.md"]
              further_reading:
                - link: "https://www.datadoghq.com/blog/monitor-flutter-application-performance-with-mobile-rum/"
                  tag: "Blog"
                  text: "Monitor Flutter application performance with Datadog Mobile RUM"
                - link: "https://github.com/DataDog/dd-sdk-flutter"
                  tag: "GitHub"
                  text: "dd-sdk-flutter Source code"
                - link: "real_user_monitoring/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your RUM data"
        - action: pull-and-push-file
          branch: main
          globs:
          - 'packages/datadog_flutter_plugin/doc/rum/otel_support.md'
          options:
            dest_path: '/real_user_monitoring/flutter/'
            file_name: 'otel_support.md'
            front_matters:
              title: OpenTelemetry Support
              kind: documentation
              description: "Learn about using OpenTelemetry with RUM Flutter."
              dependencies: ["https://github.com/DataDog/dd-sdk-flutter/blob/main/packages/datadog_flutter_plugin/doc/rum/otel_support.md"]
              further_reading:
                - link: "https://www.datadoghq.com/blog/monitor-flutter-application-performance-with-mobile-rum/"
                  tag: "Blog"
                  text: "Monitor Flutter application performance with Datadog Mobile RUM"
                - link: "https://github.com/DataDog/dd-sdk-flutter"
                  tag: "GitHub"
                  text: "dd-sdk-flutter Source code"
                - link: "real_user_monitoring/explorer/"
                  tag: "Documentation"
                  text: "Learn how to explore your RUM data"
        - action: pull-and-push-file
          branch: main
          globs:
          - 'packages/datadog_flutter_plugin/doc/troubleshooting.md'
          options:
            dest_path: '/real_user_monitoring/flutter/'
            file_name: 'troubleshooting.md'
            front_matters:
              title: Troubleshooting
              kind: documentation
              description: "Learn how to troubleshoot issues with Flutter Monitoring."
              dependencies: ["https://github.com/DataDog/dd-sdk-flutter/blob/main/packages/datadog_flutter_plugin/doc/troubleshooting.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-flutter"
                  tag: "GitHub"
                  text: "dd-sdk-flutter Source code"
                - link: "real_user_monitoring/flutter/"
                  tag: "Documentation"
                  text: "Learn about Flutter Monitoring"
        - action: pull-and-push-file
          branch: main
          globs:
          - 'packages/datadog_flutter_plugin/doc/rum/error_tracking.md'
          options:
            dest_path: '/real_user_monitoring/error_tracking/'
            file_name: 'flutter.md'
            front_matters:
              title: Flutter Crash Reporting and Error Tracking
              kind: documentation
              description: "Learn how to track Flutter errors with Error Tracking."
              dependencies: ["https://github.com/DataDog/dd-sdk-flutter/blob/main/packages/datadog_flutter_plugin/doc/rum/error_tracking.md"]
              further_reading:
                - link: "https://github.com/DataDog/dd-sdk-flutter"
                  tag: "GitHub"
                  text: "dd-sdk-flutter Source code"
                - link: "real_user_monitoring/error_tracking/"
                  tag: "Documentation"
                  text: "Learn about Error Tracking"

      - repo_name: security-monitoring
        contents:
        - action: security-rules
          branch: main
          globs:
            # old
            - "configuration/*.json"
            - "configuration/*.yaml"
            - "configuration/*.yml"
            - "configuration/*.md"
            - "runtime/**/*.json"
            - "runtime/**/*.yaml"
            - "runtime/**/*.yml"
            - "runtime/**/*.md"
            # new
            - "workload-security/backend-rules/*.yaml"
            - "workload-security/backend-rules/*.md"
            - "security-monitoring/*.json"
            - "security-monitoring/*.md"
            - "cloud-siem/**/*.json"
            - "cloud-siem/**/*.md"
            - "posture-management/**/*.json"
            - "posture-management/**/*.yaml"
            - "posture-management/**/*.yml"
            - "posture-management/**/*.md"
            - "application-security/*.json"
            - "application-security/*.md"
          options:
            dest_path: '/security/default_rules/'

      - repo_name: infrastructure-resources
        contents:
        - action: pull-and-push-folder
          branch: prod
          globs:
            - "generated/md/external/*.md"
          options:
            dest_dir: '/security/cspm/custom_rules/'
            path_to_remove: 'generated/md/external/'
            front_matters:
              disable_edit: true

      - repo_name: apps
        contents:
        - action: pull-and-push-file
          branch: master
          globs:
            - "docs/en/getting-started.md"
          options:
            dest_path: "/developers/"
            file_name: "datadog_apps.md"
            front_matters:
              dependencies: ["https://github.com/DataDog/apps/blob/master/docs/en/getting-started.md"]

      - repo_name: datadog-agent
        contents:
        - action: pull-and-push-file
          branch: main
          globs:
            - "pkg/config/config_template.yaml"
          options:
            file_name: 'agent_config.yaml'
            output_content: false
        - action: pull-and-push-folder
          branch: main
          globs:
          - 'docs/cloud-workload-security/agent_expressions.md'
          - 'docs/cloud-workload-security/backend.md'
          options:
            dest_dir: '/security/cloud_workload_security/'
            path_to_remove: 'docs/cloud-workload-security/'

      - repo_name: dd-source
        contents:
        - action: workflows
          branch: main
          globs:
            - "domains/workflow/actionplatform/apps/tools/manifest_generator/manifest.schema.json"
            - "domains/workflow/actionplatform/apps/wf-actions-worker/src/runner/bundles/com.datadoghq.*/manifest.json"
          options:
            dest_path: '/workflows/actions_catalog/'
            bundle_excludes:
              - "com.datadoghq.test"
              - "com.datadoghq.sample"`
export { parseInput, parseOutput, DEFAULT, parseOptions};