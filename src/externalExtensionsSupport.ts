import { Uri } from "vscode";

const SUPPORTED_EXTENSIONS = ['gitlens', 'git-graph'];
type SupportedExtensions = 'gitlens' | 'git-graph';

export function isSupportedExtension(scheme: string): scheme is SupportedExtensions {
    return SUPPORTED_EXTENSIONS.includes(scheme);
}

function decodeFromGitlensUri(uri: Uri): { ref: string, resourceUri: Uri } {
    const gitlensInfo = JSON.parse(uri.query) as { ref: string };
    return { ref: gitlensInfo.ref, resourceUri: Uri.file(uri.fsPath) };
}

function decodeFromGitGraphUri(uri: Uri): { ref: string, resourceUri: Uri } {
    const gitGraphInfoBase64 = uri.query;
    type GitGraphInfo = { commit: string, repo: string, filePath: string };
    const gitGraphInfo = JSON.parse(Buffer.from(gitGraphInfoBase64, 'base64').toString()) as GitGraphInfo;
    const path = Uri.joinPath(Uri.file(gitGraphInfo.repo), gitGraphInfo.filePath);
    return { ref: gitGraphInfo.commit, resourceUri: path };
}

export function uriToGitInfo(extension: SupportedExtensions, uri: Uri): { ref: string, resourceUri: Uri } {
    if (extension === 'gitlens') {
        return decodeFromGitlensUri(uri);
    } else if (extension === 'git-graph') {
        return decodeFromGitGraphUri(uri);
    } else {
        throw new Error(`Unknown extension ${extension}`);
    }
}