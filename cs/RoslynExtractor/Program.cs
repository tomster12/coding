using System.Text;
using System.Text.RegularExpressions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

if (args.Length < 2)
{
    Console.WriteLine("Usage:");
    Console.WriteLine("  RoslynExtractor <input-folder> <output-file>");
    return;
}

string inputFolder = Path.GetFullPath(args[0]);
string outputFile = Path.GetFullPath(args[1]);

if (!Directory.Exists(inputFolder))
{
    Console.WriteLine($"Input folder does not exist: {inputFolder}");
    return;
}

var csFiles = Directory
    .GetFiles(inputFolder, "*.cs", SearchOption.AllDirectories)
    .OrderBy(x => x)
    .ToList();

var output = new StringBuilder();

foreach (string file in csFiles)
{
    try
    {
        string source = File.ReadAllText(file);

        // Skeletonise entire source code from file
        SyntaxTree tree = CSharpSyntaxTree.ParseText(source);
        SyntaxNode root = tree.GetRoot();
        var rewriter = new Skeletonizer();
        var rewritten = rewriter.Visit(root);

        // Cleanup whitespace
        var rewrittenString = rewritten
            .NormalizeWhitespace()
            .ToFullString()
            .Replace("\r\n\r\n", "\r\n");

        // Collapse empty bodys
        rewrittenString = Regex.Replace(
            rewrittenString,
            @"\s*\{\s*\}",
            " { }");

        // Collapse enum bodies onto one line: { \n A,\n B,\n C\n } -> { A, B, C }
        rewrittenString = Regex.Replace(
            rewrittenString,
            @"(?<=\benum\b[^{]*)\{([^}]*)\}",
            m => "{ " + Regex.Replace(m.Groups[1].Value.Trim(), @"\s*\n\s*", " ") + " }");

        string relativePath = Path
            .GetRelativePath(inputFolder, file)
            .Replace('\\', '/');

        output.AppendLine($"// ./{relativePath}");
        output.AppendLine(rewrittenString);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Failed to parse {file}: {ex}");
    }
}

Directory.CreateDirectory(Path.GetDirectoryName(outputFile)!);
File.WriteAllText(outputFile, output.ToString());

Console.WriteLine($"Processed {csFiles.Count} files from {inputFolder}");
Console.WriteLine($"Output written to {outputFile}");

class Skeletonizer : CSharpSyntaxRewriter
{
    public override SyntaxNode? VisitMethodDeclaration(MethodDeclarationSyntax node)
    {
        node = node
            .WithBody(null)
            .WithExpressionBody(null)
            .WithSemicolonToken(
                SyntaxFactory.Token(SyntaxKind.SemicolonToken)
                    .WithTrailingTrivia(SyntaxFactory.Space));

        return base.VisitMethodDeclaration(node);
    }

    public override SyntaxNode? VisitConstructorDeclaration(ConstructorDeclarationSyntax node)
    {
        node = node
            .WithBody(null)
            .WithExpressionBody(null)
            .WithSemicolonToken(
                SyntaxFactory.Token(SyntaxKind.SemicolonToken)
                    .WithTrailingTrivia(SyntaxFactory.Space));

        return base.VisitConstructorDeclaration(node);
    }

    public override SyntaxNode? VisitDestructorDeclaration(DestructorDeclarationSyntax node)
    {
        node = node
            .WithBody(null)
            .WithExpressionBody(null)
            .WithSemicolonToken(
                SyntaxFactory.Token(SyntaxKind.SemicolonToken)
                    .WithTrailingTrivia(SyntaxFactory.Space));

        return base.VisitDestructorDeclaration(node);
    }

    public override SyntaxNode? VisitOperatorDeclaration(OperatorDeclarationSyntax node)
    {
        node = node
            .WithBody(null)
            .WithExpressionBody(null)
            .WithSemicolonToken(
                SyntaxFactory.Token(SyntaxKind.SemicolonToken)
                    .WithTrailingTrivia(SyntaxFactory.Space));

        return base.VisitOperatorDeclaration(node);
    }

    public override SyntaxNode? VisitConversionOperatorDeclaration(ConversionOperatorDeclarationSyntax node)
    {
        node = node
            .WithBody(null)
            .WithExpressionBody(null)
            .WithSemicolonToken(
                SyntaxFactory.Token(SyntaxKind.SemicolonToken)
                    .WithTrailingTrivia(SyntaxFactory.Space));

        return base.VisitConversionOperatorDeclaration(node);
    }

    public override SyntaxNode? VisitPropertyDeclaration(PropertyDeclarationSyntax node)
    {
        if (node.ExpressionBody != null)
        {
            node = node
                .WithExpressionBody(null)
                .WithSemicolonToken(
                    SyntaxFactory.Token(SyntaxKind.SemicolonToken)
                        .WithTrailingTrivia(SyntaxFactory.Space));
        }

        if (node.AccessorList != null)
        {
            var accessors = new List<AccessorDeclarationSyntax>();

            foreach (var accessor in node.AccessorList.Accessors)
            {
                var stripped = accessor
                    .WithBody(null)
                    .WithExpressionBody(null)
                    .WithSemicolonToken(
                        SyntaxFactory.Token(SyntaxKind.SemicolonToken)
                            .WithTrailingTrivia(SyntaxFactory.Space));

                accessors.Add(stripped);
            }

            node = node.WithAccessorList(
                SyntaxFactory.AccessorList(
                    SyntaxFactory.List(accessors)));
        }

        return base.VisitPropertyDeclaration(node);
    }

    public override SyntaxNode? VisitIndexerDeclaration(IndexerDeclarationSyntax node)
    {
        if (node.AccessorList != null)
        {
            var accessors = new List<AccessorDeclarationSyntax>();

            foreach (var accessor in node.AccessorList.Accessors)
            {
                var stripped = accessor
                    .WithBody(null)
                    .WithExpressionBody(null)
                    .WithSemicolonToken(
                        SyntaxFactory.Token(SyntaxKind.SemicolonToken)
                            .WithTrailingTrivia(SyntaxFactory.Space));

                accessors.Add(stripped);
            }

            node = node.WithAccessorList(
                SyntaxFactory.AccessorList(
                    SyntaxFactory.List(accessors)));
        }

        return base.VisitIndexerDeclaration(node);
    }

    public override SyntaxNode? VisitEventDeclaration(EventDeclarationSyntax node)
    {
        if (node.AccessorList != null)
        {
            var accessors = new List<AccessorDeclarationSyntax>();

            foreach (var accessor in node.AccessorList.Accessors)
            {
                var stripped = accessor
                    .WithBody(null)
                    .WithExpressionBody(null)
                    .WithSemicolonToken(
                        SyntaxFactory.Token(SyntaxKind.SemicolonToken)
                            .WithTrailingTrivia(SyntaxFactory.Space));

                accessors.Add(stripped);
            }

            node = node.WithAccessorList(
                SyntaxFactory.AccessorList(
                    SyntaxFactory.List(accessors)));
        }

        return base.VisitEventDeclaration(node);
    }

    public override SyntaxNode? VisitLocalFunctionStatement(LocalFunctionStatementSyntax node)
    {
        node = node
            .WithBody(null)
            .WithExpressionBody(null)
            .WithSemicolonToken(
                SyntaxFactory.Token(SyntaxKind.SemicolonToken)
                    .WithTrailingTrivia(SyntaxFactory.Space));

        return base.VisitLocalFunctionStatement(node);
    }

    public override SyntaxNode? VisitAnonymousMethodExpression(AnonymousMethodExpressionSyntax node)
    {
        return SyntaxFactory.LiteralExpression(
            SyntaxKind.DefaultLiteralExpression);
    }

    public override SyntaxNode? VisitCompilationUnit(CompilationUnitSyntax node)
    {
        node = node.WithUsings(default);
        return base.VisitCompilationUnit(node);
    }
}