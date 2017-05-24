export function getFeatureDuration(arr: any[]){
    let duration =0;
    for (let j=0;j<arr.length;j++){
        duration+= arr[j].result.duration !== undefined ? arr[j].result.duration : 0;
    }
    return duration;
    
}


export function getFeatureStatus(arr: any[]){
    let status = "passed";
    for (let j=0;j<arr.length;j++){
        status = arr[j].result['status'] !== "passed" ? "failed" : "passed";
        if (status === "failed"){
        break;
            }
    }
    return status;
    
}

export function isScenarioFailed(arr: any[]): boolean{
    for (let j=0;j<arr.length;j++){
        let status = arr[j].result['status'] !== "passed" ? "failed" : "passed";
        if (status === "failed"){
            return true;
            }
    }
    return false;
    
}


export function getStepPassCount(arr: any[]): number{
    let count = 0;
   

    for (let j=0;j<arr.length;j++){
        let status = arr[j].result['status'] ;
        if (status === "passed"){
            count++;
        }
    }

    return count;
    
}


export function getStepFailCount(arr: any[]): number{
    let count = 0;
   

    for (let j=0;j<arr.length;j++){
        let status = arr[j].result['status'] ;
        if (status === "failed"){
            count++;
        }
    }

    return count;
    
}

export function getStepSkipCount(arr: any[]): number{
    let count = 0;
   

    for (let j=0;j<arr.length;j++){
        let status = arr[j].result['status'] ;
        if (status === "skipped"){
            count++;
        }
    }

    return count;
    
}

export function getStepPendingCount(arr: any[]): number{
    let count = 0;
   

    for (let j=0;j<arr.length;j++){
        let status = arr[j].result['status'] ;
        if (status === "pending"){
            count++;
        }
    }

    return count;
    
}

export function getStepUndefinedCount(arr: any[]): number{
    let count = 0;
   

    for (let j=0;j<arr.length;j++){
        let status = arr[j].result['status'] ;
        if (status === "undefined"){
            count++;
        }
    }

    return count;
    
}