export async function runTest(args: { filePath: string }) {
  console.log("Running test", args.filePath);
  // TODO: Spawn child process
  return { status: "passed", output: "stub output" };
}
