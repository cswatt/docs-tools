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

export { parseInput, parseOutput, parseOptions};