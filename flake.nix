{
  description = "lang-dimacs: CodeMirror language support for DIMACS CNF as CaDiCaL reads it";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
      forAll = f: nixpkgs.lib.genAttrs systems (s: f nixpkgs.legacyPackages.${s});
    in
    {
      devShells = forAll (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_26
            pnpm
            cadical # fixture oracle
            jq # .github/scripts
          ];
        };
      });
    };
}
