import { spawn } from 'child_process';
import path from 'path';
import { AirControlDto } from '@/app/type';


const resolveJsonFile = (data: AirControlDto) => {
    if (data.mode === "COOL") {
        if (data.fanSpeed === "AUTO+") {
            return "cool_jidou_strong.json"
        } else if (data.fanSpeed === "AUTO") {
            return "cool_jidou.json"
        } else if (data.fanSpeed === "SIZUKA") {
            return "cool_sizuka.json"
        }
    } else if (data.mode === "HEAT") {
        return ""
    } else if (data.mode === "DRY") {
        return "dry.json"
    }
    return ""
}

export const airControl = async (data: AirControlDto): Promise<{ out: string }> => {

    const scriptPath = path.join(process.cwd(), '..', "scripts", 'irrp.py');

    const jsonfile = resolveJsonFile(data)
    if (jsonfile === "") {
        throw new Error('Invalid mode or fan speed')
    }

    //python3 irrp.py -p -g18 -f ${jsonfile} ${temperature}
    const pythonProcess = spawn('python3', [scriptPath, '-p', '-g18', '-f', jsonfile, data.temperature.toString()]);

    // Capture output from the Python process
    let out = ""

    pythonProcess.stdout.on('data', (data) => {
        out += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        out += data.toString();
    });

    // Wait for the process to complete
    return await new Promise((resolve, reject) => {
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve({ out });
            } else {
                reject(new Error(`Python process exited with code ${code}: ${out}`));
            }
        });

        pythonProcess.on('error', (error) => {
            reject(error);
        });
    });
}
