## Bluehawk Snippets

Bluehawk is a markup processor for extracting and manipulating arbitrary code.
With Bluehawk, you can:

- Extract code examples for use in documentation
- Generate formatted code examples for use in documentation
- Replace "finished" code with "todo" code for a branch in a tutorial repo

To use Bluehawk, you annotate your source code with Bluehawk tags. These are
essentially special comments that tell Bluehawk how to process your code.
Then, you run the Bluehawk CLI to generate code snippets based on the tags.

Most tags include `start` and `end` versions that you use together to annotate a
block of lines. Bluehawk has language-specific "comment awareness" built in for
many common languages. It can also recognize the tags outside of comments, e.g.
as literal strings.

When you start a Bluehawk snippet, append a descriptive title:

```js
// :snippet-start: person-model
```

For this example, the code block is in a file called Models.swift, so
the generated output file name would be: `Models.snippet.person-model.swift`.

### Example Annotations

#### Basic Snippet

We want to generate a code snippet based on the file `Models.swift`. We don't
need to show the `import` statement in our final example, so we start the
snippet after it. Then, after the code we want to show in our final example, we
end the snippet.

```swift
import RealmSwift

// :snippet-start: person-model
class Person: Object {
    // Required string property
    @Persisted var name: String = ""

    // Optional string property
    @Persisted var address: String?

    // Optional integral type property
    @Persisted var age: Int?
}
// :snippet-end:
```

If we run `bluehawk snip` to extract this code example, the output file is named
`Models.snippet.person-model.swift` and contains only the lines of code between
the `snippet-start` and the `snippet-end` tags:

```swift
class Person: Object {
    // Required string property
    @Persisted var name: String = ""

    // Optional string property
    @Persisted var address: String?

    // Optional integral type property
    @Persisted var age: Int?
}
```

#### Remove code

We want to extract a snippet from `ManageEmailPasswordUsers.swift` but don't
want to include every line between the `snippet-start` and `snippet-end` tags.

We use the `remove-start` and `remove-end` tags to exclude those lines. Here,
we're removing a test assertion in the `catch` block that the end user doesn't
need to see. You might also use it to remove test setup or teardown code that
isn't relevant to your end users.

```swift
func testPasswordResetFunc() async {
    // :snippet-start: password-reset-function
    let app = App(id: YOUR_REALM_APP_ID)
    let client = app.emailPasswordAuth

    let email = "forgot.my.password@example.com"
    let newPassword = "mynewpassword12345"
    // The password reset function takes any number of
    // arguments. You might ask the user to provide answers to
    // security questions, for example, to verify the user
    // should be able to complete the password reset.
    let args: [AnyBSON] = []

    // This SDK call maps to the custom password reset
    // function that you define in the backend
    do {
        try await client.callResetPasswordFunction(email: email, password: newPassword, args: args)
        print("Password reset successful!")
    } catch {
        print("Password reset failed: \(error.localizedDescription)")
        // :remove-start:
        XCTAssertEqual(error.localizedDescription, "user not found")
        // :remove-end:
    }
    // :snippet-end:
}
```

The output file from this is named
`ManageEmailPasswordUsers.snippet.password-reset-function.swift` and contains
the snippet source code without the removed lines:

```swift
let app = App(id: YOUR_REALM_APP_ID)
let client = app.emailPasswordAuth

let email = "forgot.my.password@example.com"
let newPassword = "mynewpassword12345"
// The password reset function takes any number of
// arguments. You might ask the user to provide answers to
// security questions, for example, to verify the user
// should be able to complete the password reset.
let args: [AnyBSON] = []

// This SDK call maps to the custom password reset
// function that you define in the backend
do {
    try await client.callResetPasswordFunction(email: email, password: newPassword, args: args)
    print("Password reset successful!")
} catch {
    print("Password reset failed: \(error.localizedDescription)")
}
```

#### Replace

We use the `replace` tags to replace terms in `ReadWriteData.swift` with new
terms (including, possibly, an empty string). For example, this can replace
every instance of an awkwardly named variable we have to use to avoid namespace
collisions in test files:

```swift
// :replace-start: {
//   "terms": {
//     "ReadWriteDataExamples_": ""
//   }
// }
import XCTest
import RealmSwift

// :snippet-start: models
class ReadWriteDataExamples_DogToy: Object {
    @Persisted var name = ""
}

class ReadWriteDataExamples_Dog: Object {
    @Persisted var name = ""
    @Persisted var age = 0
    @Persisted var color = ""
    @Persisted var currentCity = ""

    // To-one relationship
    @Persisted var favoriteToy: ReadWriteDataExamples_DogToy?
}

class ReadWriteDataExamples_Person: Object {
    @Persisted(primaryKey: true) var id = 0
    @Persisted var name = ""

    // To-many relationship - a person can have many dogs
    @Persisted var dogs: List<ReadWriteDataExamples_Dog>

    // Inverse relationship - a person can be a member of many clubs
    @Persisted(originProperty: "members") var clubs: LinkingObjects<ReadWriteDataExamples_DogClub>
}

class ReadWriteDataExamples_DogClub: Object {
    @Persisted var name = ""
    @Persisted var members: List<ReadWriteDataExamples_Person>
}
// :snippet-end:
// Many more lines of code examples, until eventually, we end the replace
// :replace-end:
```

As you can see, the model names such as `ReadWriteDataExamples_DogToy` are
very awkward. The `ReadWriteDataExamples` is present to avoid namespace
collisions with `Dog` or `Person` models in other test files. But this
awkward name isn't something we want to show documentation viewers.

Fortunately, replace lets us swap any instance of the term we specify with
some alternative. In this example, we replace `ReadWriteDataExamples`
with an empty string.

```swift
// :replace-start: {
//   "terms": {
//     "ReadWriteDataExamples_": ""
//   }
// }
```

The output file, `ReadWriteData.snippet.models.swift`, looks like:

```swift
class DogToy: Object {
    @Persisted var name = ""
}

class Dog: Object {
    @Persisted var name = ""
    @Persisted var age = 0
    @Persisted var color = ""
    @Persisted var currentCity = ""

    // To-one relationship
    @Persisted var favoriteToy: DogToy?
}

class Person: Object {
    @Persisted(primaryKey: true) var id = 0
    @Persisted var name = ""

    // To-many relationship - a person can have many dogs
    @Persisted var dogs: List<Dog>

    // Inverse relationship - a person can be a member of many clubs
    @Persisted(originProperty: "members") var clubs: LinkingObjects<DogClub>
}

class DogClub: Object {
    @Persisted var name = ""
    @Persisted var members: List<Person>
}
```

The long, awkward name has been replaced with nothing.
