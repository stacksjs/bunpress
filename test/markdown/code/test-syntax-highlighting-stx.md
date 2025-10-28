# STX Syntax Highlighting Test

This file tests STX (Blade-like template) syntax highlighting with ts-syntax-highlighter.

## Basic STX Template

```stx
@extends('layouts.app')

@section('content')
  <div class="container">
    <h1>Welcome</h1>
  </div>
@endsection
```

## Conditionals

```stx
@if (user.isAuthenticated)
  <h1>Welcome, {{ user.name }}!</h1>
@else
  <a href="/login">Please log in</a>
@endif
```

## Loops

```stx
<ul>
  @foreach (items as item)
    <li>{{ item.name }}</li>
  @endforeach
</ul>
```

## Components

```stx
@component('alert', { type: 'success' })
  Operation completed successfully!
@endcomponent
```

## Mixed Content

```stx
@extends('layouts.app')

@section('title', 'User Profile')

@section('content')
  <div class="profile">
    @if (user)
      <h1>{{ user.name }}</h1>
      <p>Email: {{ user.email }}</p>

      @if (user.isAdmin)
        <badge class="admin">Admin</badge>
      @endif
    @else
      <p>User not found</p>
    @endif
  </div>
@endsection
```
